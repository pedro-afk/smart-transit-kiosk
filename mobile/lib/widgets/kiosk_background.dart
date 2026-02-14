import 'package:flutter/material.dart';

class KioskBackground extends StatelessWidget {
  const KioskBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFFF8FAFC),
                Color(0xFFF2F5F9),
                Color(0xFFF6F0E6),
              ],
            ),
          ),
        ),
        Positioned(
          top: -120,
          right: -80,
          child: _GlowBall(
            size: 220,
            color: Color(0x33F4B740),
          ),
        ),
        Positioned(
          bottom: -140,
          left: -60,
          child: _GlowBall(
            size: 260,
            color: Color(0x221E3A5F),
          ),
        ),
        SafeArea(child: child),
      ],
    );
  }
}

class _GlowBall extends StatelessWidget {
  const _GlowBall({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}
