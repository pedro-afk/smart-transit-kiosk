import 'package:flutter/material.dart';
import 'package:mobile/models/ticket_purchase.dart';
import 'package:mobile/pages/login_page.dart';
import 'package:mobile/repository/ticket_repository.dart';
import 'package:mobile/widgets/kiosk_background.dart';
import 'package:mobile/widgets/kiosk_card.dart';
import 'package:qr_flutter/qr_flutter.dart';

class TicketHomePage extends StatefulWidget {
  const TicketHomePage({super.key, required this.email});

  final String email;

  @override
  State<TicketHomePage> createState() => _TicketHomePageState();
}

class _TicketHomePageState extends State<TicketHomePage> {
  final TicketRepository _ticketRepository = TicketRepository();
  late Future<List<TicketPurchase>> _ticketsFuture;

  @override
  void initState() {
    super.initState();
    _ticketsFuture = _ticketRepository.fetchPurchasesByEmail(widget.email);
  }

  Future<void> _refreshTickets() async {
    setState(() {
      _ticketsFuture = _ticketRepository.fetchPurchasesByEmail(widget.email);
    });
    await _ticketsFuture;
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  String _ticketTypeLabel(String rawType) {
    switch (rawType) {
      case 'DAY_PASS':
        return 'Day pass';
      case 'SINGLE':
      default:
        return 'Single ticket';
    }
  }

  String _ticketStatusLabel(String rawStatus) {
    switch (rawStatus) {
      case 'USED':
        return 'Used';
      case 'EXPIRED':
        return 'Expired';
      case 'ACTIVE':
      default:
        return 'Active';
    }
  }

  String _formatPayment(String rawPayment) {
    final words = rawPayment.split('_');
    return words
        .map((word) => word.isEmpty ? word : '${word[0]}${word.substring(1).toLowerCase()}')
        .join(' ');
  }

  Color _statusColor(String rawStatus) {
    switch (rawStatus) {
      case 'USED':
        return const Color(0xFF64748B);
      case 'EXPIRED':
        return const Color(0xFFB42318);
      case 'ACTIVE':
      default:
        return const Color(0xFF027A48);
    }
  }

  void _changeEmail() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginPage()),
      (route) => false,
    );
  }

  void _showQrCode(TicketPurchase purchase) {
    final qrCode = purchase.ticket?.qrCode ?? '';
    if (qrCode.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('QR code is not available for this ticket.')),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        final theme = Theme.of(context);
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Ticket QR code',
                  style: theme.textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Show this code at the station gate to validate your ticket.',
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 20),
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: QrImageView(
                      data: qrCode,
                      size: 220,
                      gapless: false,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Ticket ID: ${purchase.ticket?.id ?? purchase.ticketId}',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF64748B),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Done'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: KioskBackground(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Your tickets',
                          style: theme.textTheme.headlineLarge?.copyWith(fontSize: 30),
                        ),
                      ),
                      TextButton(
                        onPressed: _changeEmail,
                        child: const Text('Change email'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    children: [
                      _Pill(
                        label: widget.email,
                        icon: Icons.email_outlined,
                      ),
                      const _Pill(
                        label: 'Synced with kiosk',
                        icon: Icons.sync,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: FutureBuilder<List<TicketPurchase>>(
                future: _ticketsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (snapshot.hasError) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Center(
                        child: KioskCard(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Unable to load tickets',
                                style: theme.textTheme.titleLarge,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'We could not fetch tickets for this email. Please check the API and try again.',
                                style: theme.textTheme.bodyMedium,
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: _refreshTickets,
                                  child: const Text('Retry'),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }

                  final tickets = snapshot.data ?? [];
                  if (tickets.isEmpty) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Center(
                        child: KioskCard(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'No tickets found',
                                style: theme.textTheme.titleLarge,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'There are no tickets linked to this email yet.',
                                style: theme.textTheme.bodyMedium,
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton(
                                  onPressed: _refreshTickets,
                                  child: const Text('Refresh'),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: _refreshTickets,
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
                      itemCount: tickets.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        final purchase = tickets[index];
                        final ticket = purchase.ticket;
                        final status = ticket?.status ?? 'ACTIVE';
                        final statusColor = _statusColor(status);
                        final type = ticket?.type ?? 'SINGLE';

                        return KioskCard(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _ticketTypeLabel(type),
                                    style: theme.textTheme.titleLarge,
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: statusColor.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      _ticketStatusLabel(status),
                                      style: theme.textTheme.labelLarge?.copyWith(
                                        color: statusColor,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Purchased on ${_formatDate(purchase.createdAt)}',
                                style: theme.textTheme.bodyMedium,
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  _InfoTile(
                                    label: 'Amount',
                                    value: '\$${purchase.amount.toStringAsFixed(2)}',
                                  ),
                                  const SizedBox(width: 16),
                                  _InfoTile(
                                    label: 'Payment',
                                    value: _formatPayment(purchase.paymentMethod),
                                  ),
                                ],
                              ),
                              if (ticket != null) ...[
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    _InfoTile(
                                      label: 'Valid until',
                                      value: _formatDate(ticket.validUntil),
                                    ),
                                    const SizedBox(width: 16),
                                    _InfoTile(
                                      label: 'Ticket ID',
                                      value: ticket.id.length > 8
                                          ? ticket.id.substring(0, 8)
                                          : ticket.id,
                                    ),
                                  ],
                                ),
                              ],
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton.icon(
                                  onPressed: () => _showQrCode(purchase),
                                  icon: const Icon(Icons.qr_code_rounded),
                                  label: const Text('Show QR code'),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: const Color(0xFF64748B),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.85),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF1E3A5F)),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
