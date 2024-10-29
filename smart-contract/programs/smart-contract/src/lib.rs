use anchor_lang::prelude::*;

declare_id!("D2BmD9mDRktiwF7rdjB6ePCq3VvdyoetQk1X7BomD16c");

#[program]
pub mod smart_contract {
    use super::*;

    pub fn upload_setup(
        ctx: Context<UploadSetup>,
        cid: String,
        version: String,
        timestamp: i64,
    ) -> Result<()> {
        let setup_account = &mut ctx.accounts.setup_account;
        setup_account.setup.push(Setup {
            cid,
            version,
            timestamp,
        });
        Ok(())
    }

    pub fn remove_setup(ctx: Context<RemoveSetup>, cid: String) -> Result<()> {
        let setup_account = &mut ctx.accounts.setup_account;
        setup_account.setup.retain(|json| json.cid != cid);
        Ok(())
    }

    pub fn close_setup(_ctx: Context<CloseSetup>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UploadSetup<'info> {
    #[account(init_if_needed, payer = signer, space = 4 + 10 + ((59 + 6 + 8) * 5), seeds = [b"setup", signer.key().as_ref()], bump)]
    pub setup_account: Account<'info, SetupAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveSetup<'info> {
    #[account(mut, seeds = [b"setup", signer.key().as_ref()], bump)]
    pub setup_account: Account<'info, SetupAccount>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseSetup<'info> {
    #[account(mut, close = signer, seeds = [b"setup", signer.key().as_ref()], bump)]
    pub setup_account: Account<'info, SetupAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[account]
pub struct SetupAccount {
    pub setup: Vec<Setup>,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Setup {
    pub cid: String,
    pub version: String,
    pub timestamp: i64,
}
