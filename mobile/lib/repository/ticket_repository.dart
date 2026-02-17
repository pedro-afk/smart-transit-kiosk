import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile/models/ticket_purchase.dart';

class TicketRepository {
  // Expects a backend endpoint like GET /api/purchases?email=someone@domain.com
  TicketRepository({this.baseUrl = 'http://localhost:3333'});

  final String baseUrl;

  Future<List<TicketPurchase>> fetchPurchasesByEmail(String email) async {
    final uri = Uri.parse(
      '$baseUrl/api/purchases',
    ).replace(queryParameters: {'email': email});

    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      if (decoded is List) {
        final items = List<Map<String, dynamic>>.from(decoded);
        return items.map(TicketPurchase.fromJson).toList();
      }
      throw Exception('Unexpected response format');
    }

    throw Exception('Failed to load tickets');
  }
}
