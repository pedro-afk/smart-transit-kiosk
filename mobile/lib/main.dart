import 'package:flutter/material.dart';
import 'package:mobile/pages/login_page.dart';
import 'package:mobile/utils/theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartTransitMobile',
      debugShowCheckedModeBanner: false,
      theme: getApplicationTheme(),
      home: const LoginPage(),
    );
  }
}
