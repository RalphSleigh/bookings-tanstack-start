resource "google_firestore_database" "database" {
  name        = "todos"
  location_id = "europe-west2"
  type        = "FIRESTORE_NATIVE"
}
