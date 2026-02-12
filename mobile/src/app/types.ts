export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { userId?: string; token?: string } | undefined;
  Courses: undefined;
  CourseDetail: { courseId: string };
  Decks: undefined;
  DeckDetail: { deckId: string };
  Marketplace: undefined;
  Wallet: undefined;
  Reputation: undefined;
  Todos: undefined;
  TodoDetail: { todoId: string };
  Files: undefined;
  FileDetail: { fileId: string };
};
