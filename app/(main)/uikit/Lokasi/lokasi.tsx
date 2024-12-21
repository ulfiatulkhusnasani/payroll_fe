'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { ContextMenu } from 'primereact/contextmenu';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const LocationDemo = ({ children }: any) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const menu = useRef<Menu>(null);
    const contextMenu = useRef<ContextMenu>(null);
    const router = useRouter();
    const pathname = usePathname();

    const checkActiveIndex = useCallback(() => {
        const paths = pathname.split('/');
        const currentPath = paths[paths.length - 1];

        switch (currentPath) {
            case 'map':
                setActiveIndex(1);
                break;
            case 'directions':
                setActiveIndex(2);
                break;
            case 'location':
                setActiveIndex(3);
                break;
            default:
                break;
        }
    }, [pathname]);

    useEffect(() => {
        checkActiveIndex();
    }, [checkActiveIndex]);

    const nestedMenuitems = [
        {
            label: 'Maps',
            icon: 'pi pi-fw pi-map',
            items: [
                {
                    label: 'New Map',
                    icon: 'pi pi-fw pi-map-marker',
                    items: [
                        {
                            label: 'Add Location',
                            icon: 'pi pi-fw pi-plus'
                        },
                        {
                            label: 'Duplicate Map',
                            icon: 'pi pi-fw pi-copy'
                        }
                    ]
                },
                {
                    label: 'Edit Map',
                    icon: 'pi pi-fw pi-pencil'
                }
            ]
        },
        {
            label: 'Directions',
            icon: 'pi pi-fw pi-directions',
            items: [
                {
                    label: 'View Routes',
                    icon: 'pi pi-fw pi-route'
                },
                {
                    label: 'Search Directions',
                    icon: 'pi pi-fw pi-search'
                }
            ]
        },
        {
            label: 'Locations',
            icon: 'pi pi-fw pi-location',
            items: [
                {
                    label: 'Track Location',
                    icon: 'pi pi-fw pi-compass'
                },
                {
                    label: 'Location Map',
                    icon: 'pi pi-fw pi-map-marker'
                },
                {
                    label: 'Manage Locations',
                    icon: 'pi pi-fw pi-pencil'
                }
            ]
        },
        {
            label: 'Profile',
            icon: 'pi pi-fw pi-user',
            items: [
                {
                    label: 'Settings',
                    icon: 'pi pi-fw pi-cog'
                },
                {
                    label: 'Billing',
                    icon: 'pi pi-fw pi-file'
                }
            ]
        },
        {
            label: 'Logout',
            icon: 'pi pi-fw pi-sign-out'
        }
    ];

    const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        menu.current?.toggle(event);
    };

    const onContextRightClick = (event: React.MouseEvent<HTMLDivElement>) => {
        contextMenu.current?.show(event);
    };

    const menubarEndTemplate = () => {
        return (
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="text" placeholder="Search Locations" />
            </span>
        );
    };

    return (
        <div className="grid p-fluid">
            <div className="col-12">
                <div className="card">
                    <h5>Menubar</h5>
                    <Menubar model={nestedMenuitems} end={menubarEndTemplate}></Menubar>
                </div>
            </div>
            <div className="col-12 md:col-8">
                <div className="card">
                    <h5>Maps and Location</h5>
                    <div className="p-grid">
                        <div className="p-col-12 md:p-col-6">
                            <div className="card">
                                <h5>Location Map</h5>
                                {/* You can integrate a map component here, such as Google Maps or Leaflet */}
                                <div style={{ height: '300px', backgroundColor: '#f1f1f1' }}>
                                    <p>Map Placeholder</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-col-12 md:p-col-6">
                            <div className="card">
                                <h5>GPS Coordinates</h5>
                                <p>Latitude: 0.0000</p>
                                <p>Longitude: 0.0000</p>
                                <Button label="Update Coordinates" icon="pi pi-refresh" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationDemo;
