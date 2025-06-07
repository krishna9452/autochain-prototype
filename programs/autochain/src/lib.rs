use anchor_lang::prelude::*;


declare_id!("AhJJ7GNZSZGadDEirEx2j1HtjXav6nYezkFDPaE4SVti"); // Replace after deployment

#[program]
pub mod autochain {
    use super::*;

    // Initialize sensor data account
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    // Update sensor data with ZK-proof
    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        temp: u64,
        location: String,
        proof: Vec<u8>
    ) -> Result<()> {
        // Verify ZK-proof (simulated)
        require!(verify_zk_proof(&proof), ErrorCode::InvalidProof);
        
        // Update NFT data
        let nft = &mut ctx.accounts.nft_account;
        nft.temp = temp;
        nft.location = location.clone();
        nft.last_update = Clock::get()?.unix_timestamp;
        
        // Set dynamic NFT image
        nft.image_url = match temp {
            t if t < 65 => "cold".to_string(),
            t if t < 80 => "moderate".to_string(),
            _ => "hot".to_string(),
        };

        msg!("Updated: {}°F at {}", temp, location);
        Ok(())
    }
}

// Verify ZK-proof (simulated for prototype)
fn verify_zk_proof(proof: &[u8]) -> bool {
    // In real implementation, call Light Protocol verifier
    proof.len() == 64 // Simple length check
}

// NFT data structure
#[account]
pub struct NftAccount {
    pub temp: u64,          // Temperature
    pub location: String,   // Location
    pub last_update: i64,   // Unix timestamp
    pub image_url: String,  // NFT image type
}

// Initialize context
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 4 + 100 + 8 + 20, // Space allocation
        seeds = [b"nft_account"],
        bump
    )]
    pub nft_account: Account<'info, NftAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Update context
#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    #[account(
        mut,
        seeds = [b"nft_account"],
        bump
    )]
    pub nft_account: Account<'info, NftAccount>,
    pub authority: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid ZK proof")]
    InvalidProof,
}
