resource "google_cloud_run_v2_service" "default" {
  name                = "cloudrun-test-service"
  location            = "europe-west2"
  deletion_protection = false
  ingress             = "INGRESS_TRAFFIC_ALL"

  scaling {
    max_instance_count = 1
  }


  template {
    service_account = google_service_account.service_account.email
    containers {
      image = "europe-west2-docker.pkg.dev/${var.project_id}/bookings-docker-repo/bookings-app:${var.run_id}"
      env {
        name  = "GRPC_TRACE"
        value = "all"
      }
      env {
        name  = "GRPC_VERBOSITY"
        value = "DEBUG"
      }
      env {
        name  = "IN_CONTAINER"
        value = "true"
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      resources {
        limits = {
          cpu    = "0.25"
          memory = "512Mi"
        }
        cpu_idle = true
      }
    }
  }
}

resource "google_cloud_run_service_iam_binding" "default" {
  location = google_cloud_run_v2_service.default.location
  service  = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}
