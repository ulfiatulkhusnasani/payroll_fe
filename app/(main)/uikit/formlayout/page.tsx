'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

interface DropdownItem {
    name: string;
    code: string;
}

const Myprofile = () => {
    const [dropdownItem, setDropdownItem] = useState<DropdownItem | null>(null);
    const dropdownItems: DropdownItem[] = useMemo(
        () => [
            { name: 'Option 1', code: 'Option 1' },
            { name: 'Option 2', code: 'Option 2' },
            { name: 'Option 3', code: 'Option 3' }
        ],
        []
    );

    useEffect(() => {
        setDropdownItem(dropdownItems[0]);
    }, [dropdownItems]);

    return (
        <div className="grid p-fluid" style={{ maxWidth: '100%', padding: '20px' }}>
            <div className="col-12">
                <div className="card p-fluid">
                    <h5>BIODATA</h5>
                    <div className="field">
                        <label htmlFor="name">Name</label>
                        <InputText id="name" type="text" />
                    </div>
                    <div className="field">
                        <label htmlFor="username">Username</label>
                        <InputText id="username" type="text" />
                    </div>
                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <InputText id="password" type="password" />
                    </div>
                    <div className="field">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <InputText id="confirmPassword" type="password" />
                    </div>
                    <div className="field">
                        <label htmlFor="email">Email Address</label>
                        <InputText id="email" type="email" />
                    </div>
                    <div className="field">
                        <label htmlFor="birth">Birth Date</label>
                        <Calendar id="birth" />
                    </div>
                </div>
            </div>

            <div className="col-12">
                <div className="card p-fluid">
                    <h5>Upload Photo</h5>
                    <div className="field" style={{ height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px dashed #ccc' }}>
                        <p>Upload your photo here</p>
                    </div>
                </div>
            </div>

            <div className="col-12">
                <Button label="Submit" />
            </div>
        </div>
    );
};

export default Myprofile;
