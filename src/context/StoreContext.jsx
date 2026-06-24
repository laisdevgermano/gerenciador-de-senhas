import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const StoreContext = createContext(null)

const api = {
  async get(path) {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`Erro ao buscar ${path}`)
    return res.json()
  },
  async post(path, body) {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api${path}`, {
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
    const res = await fetch(`/api${path}`, {
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
    const res = await fetch(`/api${path}`, {
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
    sharedWith: pw.sharedWith?.map((sa) => (sa.user ? sa.user.id : sa)) ?? [],
  }
}

function normalizeGroup(g) {
  return {
    ...g,
    memberIds: g.members?.map((m) => m.user?.id ?? m.userId) ?? [],
  }
}

export function StoreProvider({ children, currentUser }) {
  const [passwords, setPasswords] = useState([])
  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [pwData, folderData, tagData, userData, groupData, inviteData] = await Promise.all([
          api.get('/passwords'),
          api.get('/folders'),
          api.get('/tags'),
          api.get('/users'),
          api.get('/groups'),
          api.get('/invites'),
        ])
        setPasswords(pwData.map(normalizePassword))
        setFolders(folderData)
        setTags(tagData)
        setUsers(userData)
        setGroups(groupData.map(normalizeGroup))
        setPendingInvites(inviteData)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const addGroup = useCallback(async (data) => {
    const group = await api.post('/groups', data)
    setGroups((prev) => [...prev, normalizeGroup(group)])
    return group
  }, [])

  const updateGroup = useCallback(async (id, data) => {
    const group = await api.put(`/groups/${id}`, data)
    setGroups((prev) => prev.map((g) => (g.id === id ? normalizeGroup(group) : g)))
    return group
  }, [])

  const deleteGroup = useCallback(async (id) => {
    await api.delete(`/groups/${id}`)
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const updateUser = useCallback(async (id, data) => {
    const user = await api.put(`/users/${id}`, data)
    setUsers((prev) => prev.map((u) => (u.id === id ? user : u)))
    return user
  }, [])

  const addInvite = useCallback(async (data) => {
    const invite = await api.post('/invites', data)
    setPendingInvites((prev) => [...prev, invite])
    return invite
  }, [])

  const deleteInvite = useCallback(async (id) => {
    await api.delete(`/invites/${id}`)
    setPendingInvites((prev) => prev.filter((i) => i.id !== id))
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

  const value = {
    passwords,
    folders,
    tags,
    users,
    groups,
    currentUser,
    pendingInvites,
    loading,
    addPassword,
    updatePassword,
    deletePassword,
    addFolder,
    updateFolder,
    deleteFolder,
    addTag,
    updateTag,
    deleteTag,
    addGroup,
    updateGroup,
    deleteGroup,
    updateUser,
    addInvite,
    deleteInvite,
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
