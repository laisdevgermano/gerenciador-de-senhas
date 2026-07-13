// ============================================================
// CONTEXTO GLOBAL — estado centralizado da aplicação
// ============================================================
// StoreProvider mantém todos os dados (senhas, pastas, tags,
// usuários) e expõe funções CRUD + reordenação via contexto.
// Qualquer componente pode consumir com o hook useStore().
// ============================================================

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const StoreContext = createContext(null)

// --- Cliente HTTP com timeout e autenticação JWT ---
// Todas as chamadas para a API incluem o token do localStorage
// no header Authorization. Timeout de 15s evita requisições pendentes.

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

async function handleResponse(res, path) {
  if (!res.ok) {
    let msg = `Erro ao ${path}`
    try {
      const body = await res.json()
      msg = body.error || msg
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

// Objeto com métodos HTTP (GET, POST, PUT, DELETE) que já
// injetam o token JWT e tratam erros básicos.
function handleUnauthorized(res) {
  if (res.status === 401) {
    localStorage.removeItem('user')
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.reload()
    throw new Error('Sessão expirada')
  }
}

const api = {
  async get(path) {
    const res = await fetchWithTimeout(`/api${path}`, { credentials: 'include' })
    handleUnauthorized(res)
    return handleResponse(res, `buscar ${path}`)
  },
  async post(path, body) {
    const res = await fetchWithTimeout(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    handleUnauthorized(res)
    return handleResponse(res, `criar em ${path}`)
  },
  async put(path, body) {
    const res = await fetchWithTimeout(`/api${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    handleUnauthorized(res)
    return handleResponse(res, `atualizar em ${path}`)
  },
  async delete(path) {
    const res = await fetchWithTimeout(`/api${path}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    handleUnauthorized(res)
    return handleResponse(res, `excluir em ${path}`)
  },
  async upload(path, formData) {
    const res = await fetchWithTimeout(`/api${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    handleUnauthorized(res)
    return handleResponse(res, `enviar arquivo em ${path}`)
  },
}

// --- Normalização de senha ---
// A API retorna tags e sharedWith em formato aninhado (com JOINs).
// Esta função achata os dados para o formato usado no frontend.
function normalizePassword(pw) {
  return {
    ...pw,
    // Extrai apenas o ID da tag do objeto { tag: { id } }
    tags: pw.tags?.map((pt) => (pt.tag ? pt.tag.id : pt)) ?? [],
    // Achata sharedWith: { user: { id, name }, permission }
    sharedWith: pw.sharedWith?.map((sa) => ({
      userId: sa.user?.id ?? sa.userId,
      user: sa.user ?? null,
      permission: sa.permission || 'read',
    })) ?? [],
    creator: pw.creator ?? null,
  }
}

// ============================================================
// StoreProvider
// ============================================================
// Estados globais: passwords, folders, tags, users.
// currentUser é recebido como prop após o login.
// ============================================================

export function StoreProvider({ children, currentUser }) {
  const [passwords, setPasswords] = useState([])
  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])
  const [users, setUsers] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)

  // Funcionários = todos os usuários que não são admin
  const employees = useMemo(
    () => users.filter((u) => u.role !== 'admin'),
    [users]
  )

  const isEmployee = currentUser?.role !== 'admin'

  // --- loadData: carrega todos os dados iniciais ---
  // Admin carrega tudo. Funcionário só carrega senhas compartilhadas
  // com ele (via ?userId=), tags e pastas filtradas, e NÃO carrega a
  // lista de usuários (rota exclusiva para admin).
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const promises = [api.get('/passwords'), api.get('/folders'), api.get('/tags')]
      if (!isEmployee) promises.push(api.get('/users'))

      const [pwData, folderData, tagData, userData] = await Promise.all(promises)

      setPasswords(pwData.map(normalizePassword))
      setFolders(folderData)
      setTags(tagData)
      setUsers(userData ?? [])
    } catch (err) {
      console.error('StoreContext: erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [isEmployee, currentUser?.id])

  // ============================================================
  // CRUD — Passwords
  // ============================================================
  const addPassword = useCallback(async (pwData) => {
    const pw = await api.post('/passwords', pwData)
    setPasswords((prev) => [...prev, normalizePassword(pw)])
    return pw
  }, [])

  const updatePassword = useCallback(async (id, updates) => {
    const pw = await api.put(`/passwords/${id}`, updates)
    setPasswords((prev) =>
      prev.map((p) => (p.id === id ? normalizePassword(pw) : p))
    )
    return pw
  }, [])

  const deletePassword = useCallback(async (id) => {
    await api.delete(`/passwords/${id}`)
    setPasswords((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // Reordenação drag-and-drop via PUT /passwords com array { id, sortOrder }
  const reorderPasswords = useCallback(async (orderedIds) => {
    const order = orderedIds.map((id, idx) => ({ id, sortOrder: idx }))
    await api.put('/passwords', { order })
    setPasswords((prev) => {
      const orderMap = new Map(order.map((o) => [o.id, o.sortOrder]))
      const updated = prev.map((p) => ({
        ...p,
        sortOrder: orderMap.has(p.id) ? orderMap.get(p.id) : p.sortOrder,
      }))
      updated.sort((a, b) => a.sortOrder - b.sortOrder)
      return updated
    })
  }, [])

  // ============================================================
  // CRUD — Folders (Pastas)
  // ============================================================
  const addFolder = useCallback(async (data) => {
    const folder = await api.post('/folders', data)
    setFolders((prev) => [...prev, folder])
    return folder
  }, [])

  const updateFolder = useCallback(async (id, data) => {
    const folder = await api.put(`/folders/${id}`, data)
    setFolders((prev) => prev.map((f) => (f.id === id ? folder : f)))
    return folder
  }, [])

  const deleteFolder = useCallback(async (id) => {
    await api.delete(`/folders/${id}`)
    setFolders((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const reorderFolders = useCallback(async (orderedIds) => {
    const order = orderedIds.map((id, idx) => ({ id, sortOrder: idx }))
    await api.put('/folders', { order })
    setFolders((prev) => {
      const orderMap = new Map(order.map((o) => [o.id, o.sortOrder]))
      const updated = prev.map((f) => ({
        ...f,
        sortOrder: orderMap.has(f.id) ? orderMap.get(f.id) : f.sortOrder,
      }))
      updated.sort((a, b) => a.sortOrder - b.sortOrder)
      return updated
    })
  }, [])

  // ============================================================
  // CRUD — Tags
  // ============================================================
  const addTag = useCallback(async (data) => {
    const tag = await api.post('/tags', data)
    setTags((prev) => [...prev, tag])
    return tag
  }, [])

  const updateTag = useCallback(async (id, data) => {
    const tag = await api.put(`/tags/${id}`, data)
    setTags((prev) => prev.map((t) => (t.id === id ? tag : t)))
    return tag
  }, [])

  const deleteTag = useCallback(async (id) => {
    await api.delete(`/tags/${id}`)
    setTags((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const reorderTags = useCallback(async (orderedIds) => {
    const order = orderedIds.map((id, idx) => ({ id, sortOrder: idx }))
    await api.put('/tags', { order })
    setTags((prev) => {
      const orderMap = new Map(order.map((o) => [o.id, o.sortOrder]))
      const updated = prev.map((t) => ({
        ...t,
        sortOrder: orderMap.has(t.id) ? orderMap.get(t.id) : t.sortOrder,
      }))
      updated.sort((a, b) => a.sortOrder - b.sortOrder)
      return updated
    })
  }, [])

  // ============================================================
  // CRUD — Documents (Documentos)
  // ============================================================
  // Suporta 3 tipos de destino: folder (clientes), user (funcionários), tag
  // Cada tipo tem sua própria rota de API: /folders/[id]/documents, /users/[id]/documents, /tags/[id]/documents

  function getDocumentApiBase(type, id) {
    if (type === 'user') return `/users/${id}/documents`
    if (type === 'tag') return `/tags/${id}/documents`
    return `/folders/${id}/documents`
  }

  function getDocFilterKey(type) {
    if (type === 'user') return 'userId'
    if (type === 'tag') return 'tagId'
    return 'folderId'
  }

  const loadDocuments = useCallback(async (type, id) => {
    const docs = await api.get(getDocumentApiBase(type, id))
    const key = getDocFilterKey(type)
    setDocuments((prev) => {
      const others = prev.filter((d) => d[key] !== id)
      return [...others, ...docs]
    })
    return docs
  }, [])

  const addDocument = useCallback(async (type, id, formData) => {
    const doc = await api.upload(getDocumentApiBase(type, id), formData)
    setDocuments((prev) => [...prev, doc])
    return doc
  }, [])

  const deleteDocument = useCallback(async (id) => {
    await api.delete(`/documents/${id}`)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const renameDocument = useCallback(async (id, name) => {
    const doc = await api.put(`/documents/${id}`, { name })
    setDocuments((prev) => prev.map((d) => (d.id === id ? doc : d)))
    return doc
  }, [])

  const moveDocument = useCallback(async (id, type, targetId) => {
    const data = {}
    if (type === 'folder') {
      data.folderId = targetId
      data.userId = null
      data.tagId = null
    } else if (type === 'user') {
      data.userId = targetId
      data.folderId = null
      data.tagId = null
    } else if (type === 'tag') {
      data.tagId = targetId
      data.folderId = null
      data.userId = null
    }
    const doc = await api.put(`/documents/${id}`, data)
    setDocuments((prev) => prev.map((d) => (d.id === id ? doc : d)))
    return doc
  }, [])

  const getDocumentsByFolder = useCallback(
    (folderId) => documents.filter((d) => d.folderId === folderId),
    [documents]
  )

  const getDocumentsByUser = useCallback(
    (userId) => documents.filter((d) => d.userId === userId),
    [documents]
  )

  const getDocumentsByTag = useCallback(
    (tagId) => documents.filter((d) => d.tagId === tagId),
    [documents]
  )

  // ============================================================
  // CRUD — Employees (Funcionários)
  // ============================================================
  const addEmployee = useCallback(async (data) => {
    const user = await api.post('/users', data)
    setUsers((prev) => [...prev, user])
    return user
  }, [])

  const updateEmployee = useCallback(async (id, data) => {
    const user = await api.put(`/users/${id}`, data)
    setUsers((prev) => prev.map((u) => (u.id === id ? user : u)))
    return user
  }, [])

  const deleteEmployee = useCallback(async (id) => {
    await api.delete(`/users/${id}`)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const setEmployeeAccess = useCallback(async (userId, passwordIds) => {
    await api.put(`/users/${userId}/access`, { passwordIds })
  }, [])

  const reorderEmployees = useCallback(async (orderedIds) => {
    const order = orderedIds.map((id, idx) => ({ id, sortOrder: idx }))
    await api.put('/users', { order })
    setUsers((prev) => {
      const orderMap = new Map(order.map((o) => [o.id, o.sortOrder]))
      const updated = prev.map((u) => ({
        ...u,
        sortOrder: orderMap.has(u.id) ? orderMap.get(u.id) : u.sortOrder,
      }))
      updated.sort((a, b) => a.sortOrder - b.sortOrder)
      return updated
    })
  }, [])

  // Atualização genérica de usuário (usada em Settings > Profile)
  const updateUser = useCallback(async (id, data) => {
    const user = await api.put(`/users/${id}`, data)
    setUsers((prev) => prev.map((u) => (u.id === id ? user : u)))
    return user
  }, [])

  // ============================================================
  // Funções de consulta (getters) — memoizadas por performance
  // ============================================================
  const getPasswordById = useCallback(
    (id) => passwords.find((p) => p.id === id),
    [passwords]
  )
  const getPasswordsByFolder = useCallback(
    (folderId) => passwords.filter((p) => p.folderId === folderId),
    [passwords]
  )
  const getPasswordsByTag = useCallback(
    (tagId) => passwords.filter((p) => p.tags?.includes(tagId)),
    [passwords]
  )
  const getFolderById = useCallback(
    (id) => folders.find((f) => f.id === id),
    [folders]
  )
  const getFolderByName = useCallback(
    (name) => folders.find((f) => f.name.toLowerCase() === name.toLowerCase()),
    [folders]
  )
  const getChildrenFolders = useCallback(
    (parentId) => folders.filter((f) => f.parentId === parentId),
    [folders]
  )
  const getUserById = useCallback(
    (id) => users.find((u) => u.id === id),
    [users]
  )
  const getTagById = useCallback(
    (id) => tags.find((t) => t.id === id),
    [tags]
  )
  const getTagsByFolder = useCallback(
    (folderId) => tags.filter((t) => t.parentId === folderId),
    [tags]
  )
  const getRootTags = useCallback(
    () => tags.filter((t) => !t.parentId),
    [tags]
  )
  const getEmployeeAccess = useCallback(
    (employeeId) => {
      return passwords.filter((p) =>
        p.sharedWith?.some((sa) => sa.userId === employeeId)
      )
    },
    [passwords]
  )

  // ============================================================
  // Valor exposto pelo contexto
  // ============================================================
  const value = {
    passwords, folders, tags, users, employees, currentUser, loading, documents,
    loadData,
    addPassword, updatePassword, deletePassword, reorderPasswords,
    addFolder, updateFolder, deleteFolder, reorderFolders,
    addTag, updateTag, deleteTag, reorderTags,
    addDocument, deleteDocument, loadDocuments, getDocumentsByFolder, getDocumentsByUser, getDocumentsByTag, renameDocument, moveDocument,
    addEmployee, updateEmployee, deleteEmployee,
    setEmployeeAccess, reorderEmployees, getEmployeeAccess,
    updateUser,
    getPasswordById, getPasswordsByFolder, getPasswordsByTag,
    getFolderById, getFolderByName, getChildrenFolders,
    getUserById, getTagById, getTagsByFolder, getRootTags,
  }

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  )
}

// Hook público para consumir o store
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider')
  return ctx
}
