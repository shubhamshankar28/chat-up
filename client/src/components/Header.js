import Typography from '@mui/material/Typography';
import React from 'react';
import PropTypes from 'prop-types'; 

export default function Header(props) {
    return  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Typography variant={props.variant} gutterBottom>
      {props.text}
      <br/>
    </Typography>
  </div>
}

Header.propTypes = {
  variant:PropTypes.string,
  text:PropTypes.string
}