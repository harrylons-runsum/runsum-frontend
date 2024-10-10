import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import React, { Component } from 'react';
class OneFAQ extends Component {

    render() {
        return (
            <Accordion sx={{
                backgroundColor: '#151313', color: 'white', width: '100%',
                '&:not(:last-child)': {
                    borderBottom: '1px solid #648c94' // Separating line color
                },
                boxShadow: '0px 4px 8px #000'
            }}>
                <AccordionSummary
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <div style={{ fontSize: 25 }}>
                        {this.props.question}
                    </div>
                </AccordionSummary>
                <AccordionDetails style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 18 }}>
                        {this.props.answer}
                        {this.props.link &&
                            (
                                <a style={{ color: '#648c94' }} href={this.props.link}>{this.props.link}</a>
                            )
                        }
                    </p>
                </AccordionDetails>
            </Accordion>
        )
    }
}
export default OneFAQ