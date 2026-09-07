# Deep Sight

A spectral fishing-lure colour simulator: it computes how a lure's colour
actually reaches a fish's eye through real water, rather than applying a filter.

**[Open the app →](https://luizpaybyrd.github.io/deep-sight/)**

Everything is computed on a 400–700 nm grid at 5 nm resolution:

- **Water** is built from real inherent optical properties — Pope & Fry pure-water
  absorption, CDOM/tannin, chlorophyll and suspended sediment — so red dying first,
  tannin killing blue and mud destroying contrast all fall out of the physics.
- **Lure colours** are authored reflectance spectra, so "red" genuinely reflects
  only above 590 nm and genuinely goes black at depth. Fluorescent finishes absorb
  short wavelengths and re-emit in their own band.
- **Fish eyes** use Govardovskii A1 visual-pigment templates at each species'
  measured λmax, with chromatic adaptation and a rod takeover in low light.
- **Sunlight** comes from the NOAA solar-position equations with Rayleigh and
  aerosol extinction, plus Fresnel loss at the water surface.

Includes Kromme Rijn (Utrecht) water presets, Dutch canal species — snoek,
snoekbaars, baars, roofblei, karper, blankvoorn, meerval, paling — and the Fox Rage
Ultra UV Zander Pro Shad colour range.

Runs as a website, an installable PWA, and native iOS/Android apps from one
source file. See [BUILD.md](BUILD.md).

> A physical model, not a fish. Real strikes depend on vibration, silhouette,
> speed and mood as much as colour.
