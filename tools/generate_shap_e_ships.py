"""
Shap-E 3D Spaceship Generator for Redshift Space Battles
Outputs 3D mesh files into ../assets/ships/
"""

import sys
import os
from pathlib import Path

# Add local shap-e if not in site-packages
SHAP_E_DIR = Path(r"C:\Users\krist\Desktop\shap-e")
if SHAP_E_DIR.exists() and str(SHAP_E_DIR) not in sys.path:
    sys.path.insert(0, str(SHAP_E_DIR))

try:
    import torch
    from shap_e.diffusion.sample import sample_latents
    from shap_e.diffusion.gaussian_diffusion import diffusion_from_config
    from shap_e.models.download import load_model, load_config
    from shap_e.util.notebooks import decode_latent_mesh
    HAS_SHAP_E = True
except ImportError as e:
    HAS_SHAP_E = False
    print(f"[Notice] Shap-E import status: {e}")

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "assets" / "ships"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SHIP_PROMPTS = {
    "fighter": "a sleek sci-fi fighter spaceship, aerodynamic wings, twin ion engines, dark armor",
    "interceptor": "a fast interceptor spacecraft, pointed nose, swept wings, missile pods",
    "cruiser": "a heavy battlecruiser spaceship, command bridge, broadside armor plates, gun turrets",
    "battleship": "a massive dreadnought capital warship, triple cannon batteries, reinforced armor"
}

def generate_with_shap_e():
    if not HAS_SHAP_E:
        print("Shap-E is not available. Please install dependencies or use procedural fallback.")
        return False

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Loading Shap-E models on {device}...")

    xm = load_model('transmitter', device=device)
    model = load_model('text300M', device=device)
    diffusion = diffusion_from_config(load_config('diffusion'))

    batch_size = 1
    guidance_scale = 15.0

    for ship_type, prompt in SHIP_PROMPTS.items():
        print(f"\n--- Generating 3D asset for: {ship_type} ---")
        print(f"Prompt: {prompt}")

        latents = sample_latents(
            batch_size=batch_size,
            model=model,
            diffusion=diffusion,
            guidance_scale=guidance_scale,
            model_kwargs=dict(texts=[prompt] * batch_size),
            progress=True,
            clip_denoised=True,
            use_fp16=True if device.type == 'cuda' else False,
            use_karras_sigmas=True,
            karras_steps=64,
            sigma_min=1e-3,
            sigma_max=160,
            s_churn=0,
        )

        for i, latent in enumerate(latents):
            t = decode_latent_mesh(xm, latent).tri_mesh()
            out_file = OUTPUT_DIR / f"{ship_type}.obj"
            with open(out_file, 'w') as f:
                t.write_obj(f)
            print(f"Saved: {out_file}")

    return True

if __name__ == "__main__":
    print(f"Target asset directory: {OUTPUT_DIR}")
    generate_with_shap_e()
