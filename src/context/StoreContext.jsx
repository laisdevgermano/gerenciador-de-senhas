import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const StoreContext = createContext(null)

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

const api = {
  async get(path) {
    const token = localStorage.getItem('token')
    const res = await fetchWithTimeout(`/api${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`Erro ao buscar ${path}`)
    return res.json()
  },
  async post(path, body) {
    const token = localStorage.getItem('token')
    const res = await fetchWithTimeout(`/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Erro ao criar em ${path}`)
    return res.json()
  },
  async put(path, body) {
    const token = localStorage.getItem('token')
    const res = await fetchWithTimeout(`/api${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Erro ao atualizar ${path}`)
    return res.json()
  },
  async delete(path) {
    const token = localStorage.getItem('token')
    const res = await fetchWithTimeout(`/api${path}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`Erro ao excluir ${path}`)
    return res.json()
  },
}

function normalizePassword(pw) {
  return {
    ...pw,
    tags: pw.tags?.map((pt) => (pt.tag ? pt.tag.id : pt)) ?? [],
    sharedWith: pw.sharedWith?.map((sa) => ({
      userId: sa.user?.id ?? sa.userId,
      user: sa.user ?? null,
      permission: sa.permission || 'read',
    })) ?? [],
    creator: pw.creator ?? null,
  }
}

export function StoreProvider({ children, currentUser }) {
  const [passwords, setPasswords] = useState([])
  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const employees = useMemo(
    () => users.filter((u) => u.role !== 'admin'),
    [users]
  )

  const isEmployee = currentUser?.role !== 'admin'

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const userId = isEmployee ? currentUser.id : null
      const pwPath = userId ? `/passwords?userId=${userId}` : '/passwords'
      const [pwData, folderData, tagData, userData] = await Promise.all([
        api.get(pwPath),
        api.get('/folders'),
        api.get('/tags'),
        api.get('/users'),
      ])
      setPasswords(pwData.map(normalizePassword))
      setFolders(folderData)
      setTags(tagData)
      setUsers(userData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [isEmployee, currentUser?.id])

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

  const updateUser = useCallback(async (id, data) => {
    const user = await api.put(`/users/${id}`, data)
    setUsers((prev) => prev.map((u) => (u.id === id ? user : u)))
    return user
  }, [])

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

  const getEmployeeAccess = useCallback(
    (employeeId) => {
      return passwords.filter((p) =>
        p.sharedWith?.some((sa) => sa.userId === employeeId)
      )
    },
    [passwords]
  )

  const value = {
    passwords,
    folders,
    tags,
    users,
    employees,
    currentUser,
    loading,
    loadData,
    addPassword,
    updatePassword,
    deletePassword,
    addFolder,
    updateFolder,
    deleteFolder,
    addTag,
    updateTag,
    deleteTag,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    setEmployeeAccess,
    getEmployeeAccess,
    updateUser,
    getPasswordById,
    getPasswordsByFolder,
    getPasswordsByTag,
    getFolderById,
    getChildrenFolders,
    getUserById,
    getTagById,
  }

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider')
  return ctx
}
