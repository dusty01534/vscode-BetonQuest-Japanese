import Enchantment from "./Enchantment";
import list from "./EnchantmentList.json";

/**
 * All Bukkit's Enchantments
 */
const ENCHANTMENT_LIST: Enchantment[] = list.map(v => new Enchantment(v.bukkitId, v.minecraftId, v.legacyIds));

export default ENCHANTMENT_LIST;
