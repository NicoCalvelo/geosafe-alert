resource "azurerm_private_endpoint" "key_vault" {
  name                = "${local.names.key_vault}-private-endpoint"
  location            = var.location
  resource_group_name = module.resource_group.name
  subnet_id           = module.virtual_network.private_endpoints_subnet_id

  private_service_connection {
    name = "${local.names.key_vault}-private-connection"

    private_connection_resource_id = module.key_vault.id
    is_manual_connection           = false

    subresource_names = [
      "vault"
    ]
  }

  private_dns_zone_group {
    name = "key-vault-dns"

    private_dns_zone_ids = [
      azurerm_private_dns_zone.key_vault.id
    ]
  }

  tags = local.common_tags
}