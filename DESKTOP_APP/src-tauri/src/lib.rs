// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_auth_token() -> Result<String, String> {
    // Try a few possible paths based on dev vs prod
    let possible_paths = [
        "../WEBSITE/BACKEND/data/.jwt_token",
        "../../WEBSITE/BACKEND/data/.jwt_token",
        "WEBSITE/BACKEND/data/.jwt_token",
        ".jwt_token"
    ];

    for path in possible_paths {
        if let Ok(content) = std::fs::read_to_string(path) {
            return Ok(content.trim().to_string());
        }
    }
    
    // Fallback: If not found, return empty string so frontend can still attempt open connection
    Ok("".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_auth_token])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
