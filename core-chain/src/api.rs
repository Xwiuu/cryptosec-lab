use std::sync::Arc;

use axum::{
    extract::Path,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};

use crate::node::Node;
use crate::transaction::Transaction;

#[derive(Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        ApiResponse {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn err(message: String) -> Self {
        ApiResponse {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub chain_height: usize,
    pub difficulty: u32,
    pub mempool_size: usize,
    pub chain_id: u64,
}

#[derive(Deserialize)]
pub struct TransactionRequest {
    pub from: String,
    pub to: String,
    pub amount: u64,
    pub fee: u64,
    pub nonce: u64,
    pub chain_id: u64,
    pub public_key: String,
    pub signature: String,
}

#[derive(Deserialize)]
pub struct MineRequest {
    pub miner_address: String,
}

#[derive(Serialize)]
pub struct WalletResponse {
    pub address: String,
    pub public_key: String,
}

#[derive(Deserialize)]
pub struct RegisterValidatorRequest {
    pub address: String,
    pub stake: u64,
}

pub fn create_api(node: Arc<Node>) -> Router {
    let node_state = node;

    Router::new()
        .route("/health", get(health_handler))
        .route("/chain", get(chain_handler))
        .route("/chain/latest", get(latest_block_handler))
        .route("/chain/{index}", get(block_by_index_handler))
        .route("/balance/{address}", get(balance_handler))
        .route("/mempool", get(mempool_handler))
        .route("/transaction", post(transaction_handler))
        .route("/mine", post(mine_handler))
        .route("/wallet/create", post(wallet_create_handler))
        .route("/validate-chain", get(validate_chain_handler))
        .route("/validator/register", post(register_validator_handler))
        .route("/nonce/{address}", get(nonce_handler))
        .with_state(node_state)
}

async fn health_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
) -> Json<ApiResponse<HealthResponse>> {
    let info = node.info();
    Json(ApiResponse::ok(HealthResponse {
        status: "ok".to_string(),
        chain_height: info.chain_height,
        difficulty: info.difficulty,
        mempool_size: info.mempool_size,
        chain_id: info.chain_id,
    }))
}

async fn chain_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
) -> Json<ApiResponse<Vec<crate::block::Block>>> {
    let chain = node.get_chain();
    Json(ApiResponse::ok(chain))
}

async fn latest_block_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
) -> Json<ApiResponse<crate::block::Block>> {
    match node.latest_block() {
        Some(block) => Json(ApiResponse::ok(block)),
        None => Json(ApiResponse::err("No blocks in chain".to_string())),
    }
}

async fn block_by_index_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
    Path(index): Path<u64>,
) -> Json<ApiResponse<crate::block::Block>> {
    match node.get_block(index) {
        Some(block) => Json(ApiResponse::ok(block)),
        None => Json(ApiResponse::err(format!("Block {} not found", index))),
    }
}

async fn balance_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
    Path(address): Path<String>,
) -> Json<ApiResponse<u64>> {
    match node.get_balance(&address) {
        Ok(balance) => Json(ApiResponse::ok(balance)),
        Err(e) => Json(ApiResponse::err(e.to_string())),
    }
}

async fn mempool_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
) -> Json<ApiResponse<Vec<Transaction>>> {
    let mempool = node.get_mempool();
    Json(ApiResponse::ok(mempool))
}

async fn transaction_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
    Json(req): Json<TransactionRequest>,
) -> Json<ApiResponse<String>> {
    let mut tx = Transaction::new(
        Some(req.from),
        req.to,
        req.amount,
        req.fee,
        req.nonce,
        req.chain_id,
    );
    tx.public_key = Some(req.public_key);
    tx.signature = Some(req.signature);
    tx.tx_hash = tx.calculate_hash();

    match node.add_transaction(tx) {
        Ok(()) => Json(ApiResponse::ok("Transaction added to mempool".to_string())),
        Err(e) => Json(ApiResponse::err(e.to_string())),
    }
}

async fn mine_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
    Json(req): Json<MineRequest>,
) -> Json<ApiResponse<String>> {
    match node.mine_block(&req.miner_address) {
        Ok(block) => Json(ApiResponse::ok(format!(
            "Block mined at index {} with hash {}",
            block.index, block.hash
        ))),
        Err(e) => Json(ApiResponse::err(e.to_string())),
    }
}

async fn wallet_create_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
) -> Json<ApiResponse<WalletResponse>> {
    let wallet = node.create_wallet();
    Json(ApiResponse::ok(WalletResponse {
        address: wallet.address().to_string(),
        public_key: wallet.public_key_hex(),
    }))
}

async fn validate_chain_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
) -> Json<ApiResponse<String>> {
    match node.validate_chain() {
        Ok(()) => Json(ApiResponse::ok("Chain is valid".to_string())),
        Err(e) => Json(ApiResponse::err(e.to_string())),
    }
}

async fn register_validator_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
    Json(req): Json<RegisterValidatorRequest>,
) -> Json<ApiResponse<String>> {
    match node.register_validator(&req.address, req.stake) {
        Ok(()) => Json(ApiResponse::ok("Validator registered".to_string())),
        Err(e) => Json(ApiResponse::err(e.to_string())),
    }
}

async fn nonce_handler(
    axum::extract::State(node): axum::extract::State<Arc<Node>>,
    Path(address): Path<String>,
) -> Json<ApiResponse<u64>> {
    let nonce = node.get_nonce(&address);
    Json(ApiResponse::ok(nonce))
}
