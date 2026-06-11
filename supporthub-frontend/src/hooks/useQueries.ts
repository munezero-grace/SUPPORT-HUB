import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import { getDashboardStats, getRecentTickets, pingBackend } from '@/lib/api'
import { Ticket } from '@/types/interfaces/interface'
import { ticketService } from '@/services/tickets.service'
import { clientService } from '@/services/clients.service'
import type { Client, CreateClientDto, UpdateClientDto } from '../types/clients'
import { CreateTicketData, UpdateTicketData } from '@/types/interfaces/Data'

export const queryKeys = {
  ping: ['ping'],
  dashboardStats: ['dashboardStats'],
  recentTickets: ['recentTickets'],
  tickets: ['tickets'],
  clients: ['clients'],
  products: ['products'],
} as const

// export function usePingQuery() {
//   return useQuery<PingResponse | null>({
//     queryKey: queryKeys.ping,
//     queryFn: pingBackend,
//   })
// }

// export function useDashboardStatsQuery() {
//   return useQuery<Stats[]>({
//     queryKey: queryKeys.dashboardStats,
//     queryFn: getDashboardStats,

//     staleTime: 5 * 60 * 1000,
//   })
// }

// export function useRecentTicketsQuery() {
//   return useQuery<Ticket[]>({
//     queryKey: queryKeys.recentTickets,
//     queryFn: getRecentTickets,
//     staleTime: 30 * 1000,
//   })
// }

// export function useTicketsQuery() {
//   return useQuery<Ticket[], Error>({
//     queryKey: queryKeys.tickets,
//     queryFn: ticketService.getTickets,
//     staleTime: 30 * 1000,
//     retry: 1,
//     refetchOnWindowFocus: false,
//   })
// }

export function useTicketQuery(id: string) {
  return useQuery<Ticket, Error>({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.getTicketById(id),
    enabled: !!id,
  })
}

export const useCreateTicketMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTicketData) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newTicket: Ticket = {
        id: `T-${Math.floor(Math.random() * 10000)}`,
        ...data,
        status: 'New',
        assignee: 'Unassigned',
        created: new Date().toISOString(),
        lastUpdated: 'just now',
      }
      return newTicket
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets })
      queryClient.invalidateQueries({ queryKey: queryKeys.recentTickets })
    },
  })
}

export const useUpdateTicketMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, changes }: UpdateTicketData) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { id, ...changes }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Ticket[]>(queryKeys.tickets, (oldData) => {
        if (!oldData) return oldData
        return oldData.map((ticket) =>
          ticket.id === data.id ? { ...ticket, ...data } : ticket
        )
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets })
      queryClient.invalidateQueries({ queryKey: queryKeys.recentTickets })
    },
  })
}

export const useDeleteTicketMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return id
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Ticket[]>(queryKeys.tickets, (oldData) => {
        if (!oldData) return oldData
        return oldData.filter((ticket) => ticket.id !== deletedId)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets })
      queryClient.invalidateQueries({ queryKey: queryKeys.recentTickets })
    },
  })
}

export function useClientsQuery() {
  return useQuery<Client[], Error>({
    queryKey: queryKeys.clients,
    queryFn: clientService.getAll,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  })
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient()

  return useMutation<Client, Error, CreateClientDto>({
    mutationFn: clientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
    },
  })
}

export function useUpdateClientMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    Client,
    Error,
    { clientCode: string; data: UpdateClientDto }
  >({
    mutationFn: ({ clientCode, data }) =>
      clientService.update(clientCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
    },
  })
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return id
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Ticket[]>(queryKeys.tickets, (oldData) => {
        if (!oldData) return oldData
        return oldData.filter((ticket) => ticket.id !== deletedId)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets })
      queryClient.invalidateQueries({ queryKey: queryKeys.recentTickets })
    },
  })
}
