// src/logger.ts

import { Logger } from "tslog";

// Configurações do logger
const log = new Logger({
    prettyLogTimeZone: 'local',
    type: 'pretty'
});

export default log;