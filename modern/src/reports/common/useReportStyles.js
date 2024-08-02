import {
  makeStyles
} from '@mui/styles';

export default makeStyles((theme) => ({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  containerMap: {
    flexBasis: '40%',
    flexShrink: 0,
  },
  containerMain: {
    overflow: 'auto',
  },
  header: {
    position: 'sticky',
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  columnAction: {
    width: '1%',
    paddingLeft: theme.spacing(1),
  },
  filter: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 2, 2),
  },
  filterItem: {
    minWidth: 0,
    flex: `1 1 ${theme.dimensions.filterFormWidth}`,
  },
  filterButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    flex: `1 1 ${theme.dimensions.filterFormWidth}`,
  },
  filterButton: {
    flexGrow: 1,
  },
  chart: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  selectFieldStyle: {
    boxShadow: "none",
    borderRadius: '16px',
    "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: 0,
    },
  },
  tableStyle: {
    '& th': {
      backgroundColor: '#1F2937',
      color: '#FFF'
    },
    '& td': {
      color: '#FFF',
      '& svg': {
        fill: '#FFF'
      }
    },
    [theme.breakpoints.down('md')]: {
      '& tr': {
        '& td': {
          color: '#1F2937',
          '& svg': {
            fill: '#1F2937'
          }
        }
      },
    },
  },
  autocompleteFieldStyle: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
    },
  },
  // btnShow: {
  //   // color: 'red'
  //   borderRadius: '16px',
  //   border: '1px solid #999999',
  //   background: '#FFF',
  //   '&:hover': {
  //     background: '#FFF',
  //   },
  //   [theme.breakpoints.down('md')]: {
  //     border: '2px solid green',
  //     borderRadius: '16px',
  //   },
  // }
}));