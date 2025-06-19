
export interface PokemonImageUrls {
  pikachu: string[];
  squirtle: string[];
  charmander: string[];
}

// Public Pokemon sprite URLs from various sources
const POKEMON_IMAGE_URLS: PokemonImageUrls = {
  pikachu: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/025.png',
    'https://img.pokemondb.net/sprites/home/normal/pikachu.png'
  ],
  squirtle: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/007.png',
    'https://img.pokemondb.net/sprites/home/normal/squirtle.png'
  ],
  charmander: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
    'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/004.png',
    'https://img.pokemondb.net/sprites/home/normal/charmander.png'
  ]
};

const downloadImage = async (url: string): Promise<string | null> => {
  try {
    console.log(`Attempting to download image from: ${url}`);
    
    // Create a proxy URL to handle CORS issues
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch image via proxy: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Convert the contents to a blob URL
    const imageResponse = await fetch(`data:image/png;base64,${btoa(data.contents)}`);
    const blob = await imageResponse.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    console.log(`Successfully downloaded image from: ${url}`);
    return imageUrl;
  } catch (error) {
    console.warn(`Failed to download image from ${url}:`, error);
    return null;
  }
};

const downloadImageDirect = async (url: string): Promise<string | null> => {
  try {
    console.log(`Attempting direct download from: ${url}`);
    
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'image/*',
      }
    });

    if (!response.ok) {
      console.warn(`Direct download failed: ${response.statusText}`);
      return null;
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    console.log(`Successfully downloaded image directly from: ${url}`);
    return imageUrl;
  } catch (error) {
    console.warn(`Direct download failed from ${url}:`, error);
    return null;
  }
};

export const downloadPokemonImage = async (pokemonType: keyof PokemonImageUrls): Promise<string | null> => {
  const urls = POKEMON_IMAGE_URLS[pokemonType];
  
  for (const url of urls) {
    // Try direct download first (for CORS-enabled sources)
    let imageUrl = await downloadImageDirect(url);
    
    // If direct download fails, try with proxy
    if (!imageUrl) {
      imageUrl = await downloadImage(url);
    }
    
    if (imageUrl) {
      return imageUrl;
    }
  }
  
  console.error(`Failed to download any image for ${pokemonType}`);
  return null;
};

export const downloadAllPokemonImages = async (): Promise<Record<string, string>> => {
  console.log('Starting to download Pokemon images from internet...');
  
  const pokemonTypes: (keyof PokemonImageUrls)[] = ['pikachu', 'squirtle', 'charmander'];
  const images: Record<string, string> = {};
  
  const downloadPromises = pokemonTypes.map(async (type) => {
    const imageUrl = await downloadPokemonImage(type);
    if (imageUrl) {
      images[type] = imageUrl;
    }
  });
  
  await Promise.all(downloadPromises);
  
  console.log('Finished downloading Pokemon images. Downloaded:', Object.keys(images));
  return images;
};
