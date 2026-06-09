pub mod access_control;
pub mod approval_risk;
pub mod delegatecall;
pub mod oracle_risk;
pub mod randomness;
pub mod reentrancy;
pub mod selfdestruct;
pub mod timestamp;
pub mod tx_origin;
pub mod unchecked_call;
pub mod upgradeability;

use crate::finding::Finding;

pub trait Rule {
    fn name(&self) -> &'static str;
    fn category(&self) -> &'static str;
    fn check(&self, lines: &[(usize, String)], file: &str) -> Vec<Finding>;
}

pub fn all_rules() -> Vec<Box<dyn Rule>> {
    vec![
        Box::new(access_control::AccessControlRule),
        Box::new(reentrancy::ReentrancyRule),
        Box::new(tx_origin::TxOriginRule),
        Box::new(unchecked_call::UncheckedCallRule),
        Box::new(delegatecall::DelegateCallRule),
        Box::new(randomness::RandomnessRule),
        Box::new(timestamp::TimestampRule),
        Box::new(selfdestruct::SelfDestructRule),
        Box::new(approval_risk::ApprovalRiskRule),
        Box::new(upgradeability::UpgradeabilityRule),
        Box::new(oracle_risk::OracleRiskRule),
    ]
}
