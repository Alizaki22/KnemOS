import { useQuery } from '@tanstack/react-query'
import { UserWorkspace } from '../store/workspace.store'

const API = 'http://127.0.0.1:8765'

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async (): Promise<UserWorkspace[]> => {
      const res = await fetch(`${API}/api/workspace/list`)
      if (!res.ok) throw new Error('Failed to fetch workspaces')
      const data = await res.json()
      return data.workspaces
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  })
}
