class LoginRepository {
  // TODO: Replace with real API calls when the auth endpoints are available.
  Future<void> requestLoginCode(String email) async {
    await Future.delayed(const Duration(milliseconds: 700));
  }

  Future<bool> verifyEmailCode(String email, String code) async {
    await Future.delayed(const Duration(milliseconds: 600));
    return code.length == 6;
  }
}
