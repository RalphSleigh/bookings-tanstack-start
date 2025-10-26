locals {
  services = ["firestore.googleapis.com", "run.googleapis.com", "parametermanager.googleapis.com"]
}

resource "google_project_service" "services" {
  for_each = toset(local.services)
  service = each.value
}