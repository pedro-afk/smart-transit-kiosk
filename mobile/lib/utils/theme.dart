import 'package:flutter/material.dart';

const Color _navy = Color(0xFF0B1220);
const Color _blue = Color(0xFF1E3A5F);
const Color _amber = Color(0xFFF4B740);
const Color _surface = Color(0xFFF8FAFC);
const Color _muted = Color(0xFF6B7280);

ThemeData getApplicationTheme() {
  final base = ThemeData(useMaterial3: true);

  return base.copyWith(
    colorScheme: ColorScheme.fromSeed(
      seedColor: _blue,
      primary: _blue,
      secondary: _amber,
      surface: _surface,
      brightness: Brightness.light,
    ),
    scaffoldBackgroundColor: _surface,
    textTheme: base.textTheme.copyWith(
      headlineLarge: const TextStyle(fontWeight: FontWeight.w700, color: _navy),
      headlineMedium: const TextStyle(
        fontWeight: FontWeight.w700,
        color: _navy,
      ),
      titleLarge: const TextStyle(fontWeight: FontWeight.w600, color: _navy),
      titleMedium: const TextStyle(fontWeight: FontWeight.w600, color: _navy),
      bodyLarge: const TextStyle(fontWeight: FontWeight.w500, color: _navy),
      bodyMedium: const TextStyle(fontWeight: FontWeight.w500, color: _muted),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      hintStyle: const TextStyle(color: _muted),
      labelStyle: const TextStyle(color: _muted, fontWeight: FontWeight.w600),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: _blue, width: 1.4),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: _blue,
        foregroundColor: Colors.white,
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
    ),
  );
}
