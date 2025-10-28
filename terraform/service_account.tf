resource "google_service_account" "service_account" {
  account_id   = "cloudrun-service-account"
  display_name = "Cloud Run Service Account"
}

resource "google_project_iam_member" "datastore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.service_account.email}"
}

resource "google_project_iam_member" "parameter_accessor" {
  project = var.project_id
  role    = "roles/parametermanager.parameterAccessor"
  member  = "serviceAccount:${google_service_account.service_account.email}"
}

resource "google_project_iam_member" "parameter_viewer" {
  project = var.project_id
  role    = "roles/parametermanager.parameterViewer"
  member  = "serviceAccount:${google_service_account.service_account.email}"
}




