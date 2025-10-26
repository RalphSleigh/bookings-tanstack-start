terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }

  backend "gcs" {
    bucket = "bookings-gcp-terraform-state"
    prefix = "terraform/state"
  }

}

provider "google" {
  region  = "europe-west2"
  project = var.project_id
}