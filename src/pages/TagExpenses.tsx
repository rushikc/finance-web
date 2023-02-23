// src/pages/Home.tsx

import React, {ReactElement, FC, useState, useEffect} from "react";
import {Box, Typography, Chip} from "@mui/material";
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import DoneIcon from '@mui/icons-material/Done';
import { ExpenseAPI } from "../api/ExpenseAPI";
import { Col, Row } from "reactstrap";
import { JSONObject } from "./Constants";
import Button from "@mui/material/Button/Button";
import { DateTime } from "luxon";
import { getDateTime, sortByTime } from "../Utiliy";
import Checkbox from "@mui/material/Checkbox/Checkbox";
import { getUnTaggedExpenseList } from "../api/BaseApi";
import { Expense } from "../api/Types";


const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: 60,
  lineHeight: '60px',
}));



const tag_list = ['food', 'groceries', 'Amenities', 'veg & fruits', 'snacks',
'shopping' , 'rent', 'extra','ironing', 'petrol', 'transport', 'parents', 
'emi', 'medical', 'clothes','noodles', 'fitness', 'alcohol']



const TagExpenses: FC<any> = (): ReactElement => {

    const DrawerHeader = styled('div')(({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
      }));


    
    const [expenseIndex, setexpenseIndex] = useState<number>(0);
    const [tagIndex, setTagIndex] = useState<number>(-1);
    const [expense, setexpense] = useState<Expense[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<string[]>([]);
    const [autoTag, setAutoTag] = useState<boolean>(false);


    

    useEffect(() => {

      getUnTaggedExpenseList().then((res) => {
        res = sortByTime(res, 'date');
        console.log("Expense List -> ", res[1]);
        console.log("Expense List -> ", res[150]);
        setexpense(res);
      });

    }, []);


    const handleSelectedTag = (id: string, tag: string) => {
      setSelectedExpense([tag]);
      if(autoTag){
        ExpenseAPI.autoTagExpense(expense[expenseIndex].vendor, tag).then(() => {
          setTimeout(() => {
            setexpenseIndex(expenseIndex+1);
            setSelectedExpense([]);
            setAutoTag(false);
          }, 200);
        })
      }else{
        // ExpenseAPI.tagExpense(id, tag).then(() => {
        //   setTimeout(() => {
        //     setexpenseIndex(expenseIndex+1);
        //     setSelectedExpense([]);
        //     setAutoTag(false);
        //   }, 200);
        // })
      }
    }

    const handleTagIndex = (action: '+' | '-' ) => {
      if(action === '+'){
        setTagIndex(tagIndex+8);
      }else{
        setTagIndex(tagIndex-8);
      }
    }
    

    return (
      <Box component="main">
        <DrawerHeader />

        {
            expense.length > 0 &&
            <Item elevation={10} sx={{marginTop: 4,margin: 2, height: '100vh'}}>
                <div style={{fontSize: '20px', fontWeight: 600, color: '#26559bcf'}}>
                    Tag Expenses
                </div>
                <Chip 
                    icon={<CurrencyRupeeIcon sx={{width: 25}} />} 
                    label={expense[expenseIndex].cost} 
                    sx={{fontSize: "25px"}}
                />

                
                <div style={{fontSize: "18px", overflow: 'hidden'}}>
                    {expense[expenseIndex].vendor}
                </div>

                
                <div style={{fontSize: "18px"}}>
                    {DateTime.fromISO(expense[expenseIndex].date).toLocaleString(DateTime.DATE_MED)}
                    {" - "}
                    <b>{getDateTime(DateTime.fromISO(expense[expenseIndex].date).toLocaleString(DateTime.TIME_SIMPLE))}</b>
                </div>

                <div>
                  <span style={{fontSize: "15px"}}>Auto tag </span>
                  <Checkbox onChange={() => setAutoTag(!autoTag)} checked={autoTag} />
                </div>
                

                <div className="container">
                  <div className="row" >
                    
                    {
                      tag_list.map((val, index) => (
                        <div className="col-4" key={index} >
                          <Button 
                            style={{
                              width: '120px', 
                              height: '50px',
                              // marginRight: (index+1)%2 == 0? '10px': '0px',
                              // marginLeft: (index+1)%2 == 0? '0px': '10px',
                            }} 
                            variant={selectedExpense.includes(val)? "contained": "outlined"}
                            onClick={() => 
                              handleSelectedTag(expense[expenseIndex].id, selectedExpense.includes(val)? "" : val)}
                            >
                            {val}
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                  <Row>
                    <Button 
                      style={{
                        width: '190px', 
                        height: '40px',
                        marginTop: '30px',
                        marginLeft: '45px',
                      }}
                      variant={"contained"}
                      onClick={() => 
                        handleSelectedTag(expense[expenseIndex].id,'ignore')}
                      >
                      skip
                    </Button>
                    <Button style={{
                        width: '190px', 
                        height: '40px',
                        marginTop: '30px',
                        marginLeft: '10px',
                      }} 
                      variant="contained" 
                      startIcon={<SettingsBackupRestoreIcon />}
                      onClick={() => setexpenseIndex(expenseIndex-1)}
                    />
                    {/* <Button 
                      style={{
                        width: '70px', 
                        height: '40px',
                        marginTop: '30px',
                        marginLeft: '10px',
                      }} 
                      variant={"contained"}
                      onClick={() => handleTagIndex('-')}
                      >
                      {'<<'}
                    </Button>
                    <Button 
                      style={{
                        width: '70px', 
                        height: '40px',
                        marginTop: '30px',
                        marginLeft: '10px',
                      }} 
                      variant={"contained"}
                      onClick={() => 
                        handleTagIndex('+')}
                      >
                      {'>>'}
                    </Button> */}
                  </Row>
                </div>
            </Item>
        }

        

      </Box>
    );
};

export default TagExpenses;