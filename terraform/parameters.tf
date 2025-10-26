resource "google_parameter_manager_parameter" "config" {
  parameter_id = "config"
  format = "JSON"
}

resource "google_parameter_manager_parameter_version" "config_default" {
  parameter = google_parameter_manager_parameter.config.id
  parameter_version_id = "default"
  parameter_data = jsonencode({
    "AUTH0_CLIENT_SECRET": "string",
    "AUTH0_CLIENT_ID": "string",
    "AUTH0_DOMAIN": "string"
  })
}