export const setBaseUrl = (url = '') => {
  // no-op placeholder
};

export const useGetCurrentUser = () => ({ data: null, isLoading: false, isError: false });
export const useLogin = () => ({ mutate: async () => {} });
export const useLogout = () => ({ mutate: async () => {} });
export const getGetCurrentUserQueryKey = () => ["currentUser"];

export const useListNotifications = () => ({ data: [], isLoading: false, isError: false });
export const useGetAnalyticsSummary = () => ({ data: {}, isLoading: false, isError: false });
export const useGetAppointmentsBySpecialty = () => ({ data: [], isLoading: false, isError: false });
export const useGetAppointmentsOverTime = () => ({ data: [], isLoading: false, isError: false });

export const useListAuditLog = () => ({ data: [], isLoading: false, isError: false });
export const getListAuditLogQueryKey = () => ["auditLog"];

export const useListSpecialties = () => ({ data: [], isLoading: false, isError: false });
export const useCreateSpecialty = () => ({ mutate: async () => {} });
export const useUpdateSpecialty = () => ({ mutate: async () => {} });
export const useDeleteSpecialty = () => ({ mutate: async () => {} });
export const getListSpecialtiesQueryKey = () => ["specialties"];

export const useListAppointments = () => ({ data: [], isLoading: false, isError: false });
export const useConfirmAppointment = () => ({ mutate: async () => {} });
export const useCancelAppointment = () => ({ mutate: async () => {} });
export const getListAppointmentsQueryKey = () => ["appointments"];

export const useGetWeeklySchedule = () => ({ data: [], isLoading: false, isError: false });
export const useListDoctors = () => ({ data: [], isLoading: false, isError: false });
export const useCreateDoctor = () => ({ mutateAsync: async () => {} });
export const useUpdateDoctor = () => ({ mutateAsync: async () => {} });
export const getListDoctorsQueryKey = () => ["doctors"];
export const getGetWeeklyScheduleQueryKey = () => ["weeklySchedule"];

export const useGetWorkingHours = () => ({ data: [], isLoading: false, isError: false });
export const useUpdateWorkingHours = () => ({ mutate: async () => {} });
export const getGetWorkingHoursQueryKey = () => ["workingHours"];

export const useGetDoctorAvailableSlots = () => ({ data: [], isLoading: false, isError: false });
export const useCreateAppointment = () => ({ mutateAsync: async () => {} });
export const getGetDoctorAvailableSlotsQueryKey = () => ["doctorAvailableSlots"];

export const useMarkNotificationRead = () => ({ mutateAsync: async () => {} });
export const useMarkAllNotificationsRead = () => ({ mutateAsync: async () => {} });
export const getListNotificationsQueryKey = () => ["notifications"];

export const useCompleteAppointment = () => ({ mutateAsync: async () => {} });

export const useListUsers = () => ({ data: [], isLoading: false, isError: false });
export const useCreateUser = () => ({ mutateAsync: async () => {} });
export const useUpdateUser = () => ({ mutateAsync: async () => {} });
export const useDeleteUser = () => ({ mutateAsync: async () => {} });
export const getListUsersQueryKey = () => ["users"];
