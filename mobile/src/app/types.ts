export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { userId?: string; token?: string } | undefined;
  Todos: undefined;
  TodoDetail: { todoId: string };
};
