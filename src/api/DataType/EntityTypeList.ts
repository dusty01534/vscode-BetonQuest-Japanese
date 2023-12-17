import EntityType from "./EntityType";
import list from "./EntityTypeList.json";

/**
 * All Bukkit's EntityTypes
 */
const ENTITY_TYPE_LIST: EntityType[] = list.map(v => new EntityType(v.bukkitId, v.minecraftId, v.legacyIds));

export default ENTITY_TYPE_LIST;
