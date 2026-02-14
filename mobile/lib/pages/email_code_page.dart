import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/pages/home_page.dart';
import 'package:mobile/repository/login_repository.dart';
import 'package:mobile/widgets/kiosk_background.dart';
import 'package:mobile/widgets/kiosk_card.dart';

class EmailCodePage extends StatefulWidget {
  const EmailCodePage({super.key, required this.email});

  final String email;

  @override
  State<EmailCodePage> createState() => _EmailCodePageState();
}

class _EmailCodePageState extends State<EmailCodePage> {
  final LoginRepository _loginRepository = LoginRepository();
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get _code => _controllers.map((controller) => controller.text).join();

  void _handleCodeChange(int index, String value) {
    final cleaned = value.replaceAll(RegExp(r'\D'), '');
    if (cleaned.isEmpty) {
      if (index > 0) {
        _focusNodes[index - 1].requestFocus();
      }
      return;
    }

    if (cleaned.length > 1) {
      _fillCode(cleaned);
      return;
    }

    _controllers[index].text = cleaned;
    if (index < _focusNodes.length - 1) {
      _focusNodes[index + 1].requestFocus();
    } else {
      _focusNodes[index].unfocus();
    }
  }

  void _fillCode(String value) {
    final digits = value.split('');
    for (var i = 0; i < _controllers.length; i++) {
      _controllers[i].text = i < digits.length ? digits[i] : '';
    }
    if (digits.length >= _controllers.length) {
      _focusNodes.last.unfocus();
    }
  }

  Future<void> _verify() async {
    if (_code.length != 6) {
      setState(() {
        _errorMessage = 'Enter the 6-digit code.';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final isValid = await _loginRepository.verifyEmailCode(widget.email, _code);
      if (!mounted) return;
      if (!isValid) {
        setState(() {
          _errorMessage = 'Invalid code. Please try again.';
        });
        return;
      }

      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => TicketHomePage(email: widget.email),
        ),
        (route) => false,
      );
    } catch (error) {
      setState(() {
        _errorMessage = 'We could not verify the code. Please try again.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  Future<void> _resendCode() async {
    setState(() {
      _errorMessage = null;
    });
    await _loginRepository.requestLoginCode(widget.email);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('A new code has been sent.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: KioskBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Email verification',
                style: theme.textTheme.headlineLarge?.copyWith(fontSize: 30),
              ),
              const SizedBox(height: 8),
              Text(
                'We sent a 6-digit code to',
                style: theme.textTheme.bodyMedium?.copyWith(fontSize: 16),
              ),
              const SizedBox(height: 6),
              Text(
                widget.email,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: const Color(0xFF1E3A5F),
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 24),
              KioskCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Enter code',
                      style: theme.textTheme.titleLarge,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(
                        6,
                        (index) => SizedBox(
                          width: 48,
                          child: TextField(
                            controller: _controllers[index],
                            focusNode: _focusNodes[index],
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                            maxLength: 1,
                            decoration: const InputDecoration(
                              counterText: '',
                              contentPadding: EdgeInsets.symmetric(vertical: 14),
                            ),
                            onChanged: (value) => _handleCodeChange(index, value),
                          ),
                        ),
                      ),
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        _errorMessage!,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: const Color(0xFFB42318),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _verify,
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('Verify and continue'),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: TextButton(
                        onPressed: _resendCode,
                        child: const Text('Resend code'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
