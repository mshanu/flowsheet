package org.openmrs.module.flowsheet.impl;

import org.openmrs.module.flowsheet.Flowsheet;

public interface FlowsheetService {
    public Flowsheet getFlowsheet(int patientId);
}
