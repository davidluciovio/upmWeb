export interface ProductionReport {
    partNumber:      PartNumber;
    startDatetime:   Date;
    endDatetime:     Date;
    timeProductions: TimeProduction[];
}

export interface PartNumber {
    partNumberId:              string;
    partNumberName:            string;
    objectiveTime:             number;
    netoTime:                  number;
    partNumberConfigurationId: PartNumberConfigurationID;
}

export interface PartNumberConfigurationID {
    partNumberConfiogurationId: number;
    partNumberId:               string;
    lineId:                     string;
    modelId:                    number;
}

export interface TimeProduction {
    time:       Date;
    production: number;
    plan:       number;
    efectivity: number;
    downtimes:  DowntimeElement[];
}

export interface DowntimeElement {
    minutes:  string;
    downtime: Downtime;
}

export interface Downtime {
    downtimeId:       string;
    description:      string;
    inforCode:        string;
    plcCode:          string;
    isDirectDowntime: boolean;
    programable:      boolean;
}
