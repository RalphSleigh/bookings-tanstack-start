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
      image = "europe-west2-docker.pkg.dev/bookings-gcp/bookings-docker-repo/nitro-app:5"
      env {
        name  = "GRPC_TRACE"
        value = "all"
      }
      env {
        name  = "GRPC_VERBOSITY"
        value = "DEBUG"
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
