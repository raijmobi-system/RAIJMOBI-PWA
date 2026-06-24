use tauri::{WebviewUrl, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let port = 9527; 
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_geolocation::init());

    // 1. O segredo: SÓ ativa o plugin de localhost em PRODUÇÃO (APK final)
    #[cfg(not(debug_assertions))]
    {
        builder = builder.plugin(tauri_plugin_localhost::Builder::new(port).build());
    }

    builder
        .setup(move |app| {
            // Em modo Debug/Dev, o Tauri v2 usa a URL padrão do tauri.conf.json automaticamente.
            // Só customizamos a janela manualmente se estivermos em modo Release (Produção)
            #[cfg(not(debug_assertions))]
            {
                let url = format!("http://localhost:{}", port).parse::<tauri::Url>().unwrap();
                tauri::webview::WebviewWindowBuilder::new(
                    app.handle(), 
                    "main", 
                    WebviewUrl::External(url)
                )
                .title("Raijmobi")
                .build()?;
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}