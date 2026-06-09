use std::sync::Arc;

use axum::serve;
use tokio::net::TcpListener;
use tracing_subscriber::EnvFilter;

use core_chain::api::create_api;
use core_chain::config::BlockchainConfig;
use core_chain::node::Node;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let config = BlockchainConfig::default();
    let node = Arc::new(Node::new(config));
    let app = create_api(node);

    let addr = format!("{}:{}", "127.0.0.1", 8545);
    tracing::info!("CryptoSec Lab - Blockchain API starting on {}", addr);

    let listener = TcpListener::bind(&addr)
        .await
        .expect("Failed to bind address");

    serve(listener, app).await.expect("Server failed");
}
