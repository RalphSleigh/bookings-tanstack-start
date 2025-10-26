resource "google_artifact_registry_repository" "bookings-docker-repo" {
  location      = "europe-west2"
  repository_id = "bookings-docker-repo"
  description   = "bookings docker repository"
  format        = "DOCKER"
}