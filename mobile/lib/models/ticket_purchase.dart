class Ticket {
  Ticket({
    required this.id,
    required this.type,
    required this.status,
    required this.validUntil,
    required this.qrCode,
    required this.createdAt,
  });

  final String id;
  final String type;
  final String status;
  final DateTime validUntil;
  final String qrCode;
  final DateTime createdAt;

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'SINGLE',
      status: json['status']?.toString() ?? 'ACTIVE',
      validUntil: DateTime.tryParse(json['validUntil']?.toString() ?? '') ?? DateTime.now(),
      qrCode: json['qrCode']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

class TicketPurchase {
  TicketPurchase({
    required this.id,
    required this.ticketId,
    required this.buyerName,
    required this.buyerEmail,
    required this.paymentMethod,
    required this.amount,
    required this.createdAt,
    this.buyerPhone,
    this.ticket,
  });

  final String id;
  final String ticketId;
  final String buyerName;
  final String buyerEmail;
  final String? buyerPhone;
  final String paymentMethod;
  final double amount;
  final DateTime createdAt;
  final Ticket? ticket;

  factory TicketPurchase.fromJson(Map<String, dynamic> json) {
    final ticketJson = json['ticket'];
    return TicketPurchase(
      id: json['id']?.toString() ?? '',
      ticketId: json['ticketId']?.toString() ?? '',
      buyerName: json['buyerName']?.toString() ?? 'Unknown',
      buyerEmail: json['buyerEmail']?.toString() ?? '',
      buyerPhone: json['buyerPhone']?.toString(),
      paymentMethod: json['paymentMethod']?.toString() ?? 'CREDIT_CARD',
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : 0,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      ticket: ticketJson is Map<String, dynamic> ? Ticket.fromJson(ticketJson) : null,
    );
  }
}
