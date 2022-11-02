import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import Mobheader from '../Mobile-Header/Mobheader';
import Mobsidebar from '../Mobile-Sidebar/Mobsidebar';
import { ThemeProvider, useThemeUpdate } from '../../Context/MenuContext';

function Layoutwithmobile(component) {
    const toggleMenu = useThemeUpdate();
    return (
        <div className="main">
            <ThemeProvider>
                <Mobheader />
                <Container fluid>
                    <Row>
                        <Mobsidebar />
                        <Col lg={8} md={7} sm={7} className="p-0 mainWrapBox">
                            <div className="mainArea layoutHeaderArea" onClick={toggleMenu}>{component}</div>
                        </Col>
                    </Row>
                </Container>
            </ThemeProvider>
        </div>
    );
}

export default Layoutwithmobile;
