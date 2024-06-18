import { renderWithTheme } from "src/utilities/testHelpers";
import { CloudPulseDashboardSelect, CloudPulseDashboardSelectProps } from "./CloudPulseDashboardSelect";
import React from "react";

const props : CloudPulseDashboardSelectProps = {
    handleDashboardChange : vi.fn(),
}

describe("CloudPulse Dashboard select", ()=>{
    it("Should render dashboard select component", ()=>{
        const {getByTestId} = renderWithTheme(
            <CloudPulseDashboardSelect {...props} />
        );
            
        expect(getByTestId('cloudview-dashboard-select')).toBeInTheDocument();

    })
})