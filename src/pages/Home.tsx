import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import GroupIcon from '@mui/icons-material/ViewModule';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import CloseIcon from '@mui/icons-material/Close';
import {Avatar, Chip, Fab, IconButton, InputAdornment, TextField, Zoom} from '@mui/material';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import React, {FC, ReactElement, useEffect, useRef, useState} from "react";
import {useSelector} from 'react-redux';
import {Col, Row} from "reactstrap";
import {Expense} from '../api/Types';
import Loading from '../components/Loading';
import {selectExpense, setTagExpense} from '../store/expenseActions';
import {getDateMonth, sortByKeyDate} from '../utility/utility';
import './Home.scss';
import dayjs from 'dayjs';

// Add interface to extend Window type
declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    scrollTimeout: ReturnType<typeof setTimeout> | undefined;
  }
}

// Define date range options
type DateRange = '1d' | '7d' | '14d' | '30d' | '90d' | '180d' | '366d';

const filterOptions: { id: DateRange, label: string }[] = [
  {id: '1d', label: '1 Day'},
  {id: '7d', label: '7 Days'},
  {id: '14d', label: '2 Weeks'},
  {id: '30d', label: '1 Month'},
  {id: '90d', label: '3 Month'},
  {id: '180d', label: '6 Month'},
  {id: '366d', label: '1 year'},
];

// Define group by options
type GroupByOption = 'days' | 'vendor' | 'cost' | 'tags';

const groupByOptions: { id: GroupByOption, label: string }[] = [
  {id: 'days', label: 'Days'},
  {id: 'vendor', label: 'Vendor'},
  {id: 'cost', label: 'Cost Range'},
  {id: 'tags', label: 'Tags'},
];

// Define sort by options
type SortByOption = 'cost' | 'count' | 'date' | null;

const sortByOptions: { id: SortByOption, label: string }[] = [
  {id: 'cost', label: 'Total Cost'},
  {id: 'count', label: 'Expenses Count'},
];

// Interface for grouped expenses
interface GroupedExpenses {
  [groupKey: string]: {
    groupLabel: string;
    expenses: Expense[];
    totalAmount: number;
  }
}

const Home: FC<any> = (): ReactElement => {
  const {expenseList} = useSelector(selectExpense);
  const [selectedRange, setSelectedRange] = useState<DateRange>('7d');
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isRegrouping, setIsRegrouping] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilteredExpenses, setDateFilteredExpenses] = useState<Expense[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [groupedExpenses, setGroupedExpenses] = useState<GroupedExpenses>({});
  const [collapsedGroups, setCollapsedGroups] = useState<{ [groupKey: string]: boolean }>({});
  const [selectedGroupBy, setSelectedGroupBy] = useState<GroupByOption>('days');
  const [selectedSortBy, setSelectedSortBy] = useState<SortByOption>(null);
  const [showGroupByOptions, setShowGroupByOptions] = useState(false);
  const [allCollapsed, setAllCollapsed] = useState(false);

  // Refs for handling outside clicks
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const groupByPanelRef = useRef<HTMLDivElement>(null);
  const groupByButtonRef = useRef<HTMLDivElement>(null);

  const onSetExpense = (expense: Expense) => setTagExpense(expense);
  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (showGroupByOptions) setShowGroupByOptions(false);
  };

  const toggleGroupByOptions = () => {
    setShowGroupByOptions(!showGroupByOptions);
    if (showFilters) setShowFilters(false);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle scroll events to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down 300px
      setShowScrollTop(window.scrollY > 300);

      // Add scrolling class to body during scroll
      document.body.classList.add('scrolling');

      // Clear previous timeout if it exists
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }

      // Set timeout to remove scrolling class after scrolling stops
      window.scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
      }, 300); // Remove class after 300ms of scroll inactivity
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }
    };
  }, []);

  // Filter expenses based on selected date range
  useEffect(() => {
    if (expenseList.length === 0) {
      setDateFilteredExpenses([]);
      return;
    }

    const now = dayjs();
    let startDate: dayjs.Dayjs;

    switch (selectedRange) {
      case '1d':
        startDate = now.subtract(1, 'day');
        break;
      case '7d':
        startDate = now.subtract(7, 'day');
        break;
      case '14d':
        startDate = now.subtract(14, 'day');
        break;
      case '30d':
        startDate = now.subtract(30, 'day');
        break;
      case '90d':
        startDate = now.subtract(90, 'day');
        break;
      case '180d':
        startDate = now.subtract(180, 'day');
        break;
      case '366d':
        startDate = now.subtract(366, 'day');
        break;
      default:
        startDate = now.subtract(7, 'day');
    }

    const filtered = expenseList.filter(expense => {
      const expenseDate = dayjs(expense.date);
      return expenseDate.isAfter(startDate) || expenseDate.isSame(startDate, 'day');
    });

    const sortedExpenses = sortByKeyDate(filtered, 'date');
    setDateFilteredExpenses(sortedExpenses);

  }, [expenseList, selectedRange]);

  // Apply search filter after date filtering
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // If no search term, show all date-filtered expenses
      setFilteredExpenses(dateFilteredExpenses);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const searchResults = dateFilteredExpenses.filter(expense => {
      return (
        expense.vendor.toLowerCase().includes(searchTermLower) ||
        expense.cost.toString().includes(searchTermLower) ||
        (expense.tag && expense.tag.toLowerCase().includes(searchTermLower))
      );
    });

    setFilteredExpenses(searchResults);
  }, [dateFilteredExpenses, searchTerm]);

  // Group expenses based on selected grouping option
  useEffect(() => {
    if (filteredExpenses.length === 0) {
      setGroupedExpenses({});
      setIsRegrouping(false); // Reset regrouping state
      return;
    }

    const grouped: GroupedExpenses = {};

    filteredExpenses.forEach(expense => {
      let groupKey: string;
      let groupLabel: string;

      // Group by different criteria based on selectedGroupBy
      switch (selectedGroupBy) {
        case 'days':
          // Use date as key (without time part)
          groupKey = dayjs(expense.date).format('YYYY-MM-DD');
          groupLabel = getDateMonth(expense.date);
          break;

        case 'vendor':
          // Use vendor name as key
          groupKey = expense.vendor.toLowerCase();
          groupLabel = expense.vendor;
          break;

        case 'cost':
          // Create cost ranges (0-100, 100-500, 500-1000, 1000+)
          const cost = Number(expense.cost);
          if (cost <= 100) {
            groupKey = 'range_0_100';
            groupLabel = '₹0 - ₹100';
          } else if (cost <= 500) {
            groupKey = 'range_100_500';
            groupLabel = '₹100 - ₹500';
          } else if (cost <= 1000) {
            groupKey = 'range_500_1000';
            groupLabel = '₹500 - ₹1000';
          } else {
            groupKey = 'range_1000_plus';
            groupLabel = '₹1000+';
          }
          break;

        case 'tags':
          // Use tag as key, or "untagged" for null tags
          groupKey = expense.tag ? expense.tag.toLowerCase() : 'untagged';
          groupLabel = expense.tag ? expense.tag : 'Untagged';
          break;

        default:
          groupKey = dayjs(expense.date).format('YYYY-MM-DD');
          groupLabel = getDateMonth(expense.date);
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          groupLabel,
          expenses: [],
          totalAmount: 0
        };
        setCollapsedGroups(prev => ({...prev, [groupKey]: selectedGroupBy !== 'days'}));
      }

      grouped[groupKey].expenses.push(expense);
      grouped[groupKey].totalAmount += Number(expense.cost);
    });

    setGroupedExpenses(grouped);
    setLoading(false);

    setTimeout(() => {
      setIsRegrouping(false);
    }, 300);

  }, [filteredExpenses, selectedGroupBy, selectedSortBy]);

  // Toggle collapse state for a group
  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Toggle all groups collapse state
  const toggleAllGroupsCollapse = () => {
    const newCollapsedState = !allCollapsed;
    setAllCollapsed(newCollapsedState);

    // Create a new object with all groups set to the same collapse state
    const updatedCollapsedGroups: { [key: string]: boolean } = {};
    Object.keys(groupedExpenses).forEach(key => {
      updatedCollapsedGroups[key] = newCollapsedState;
    });

    setCollapsedGroups(updatedCollapsedGroups);
  };

  // Update allCollapsed state when grouped expenses change
  useEffect(() => {
    if (Object.keys(groupedExpenses).length === 0) {
      setAllCollapsed(false);
      return;
    }

    // Check if all groups are currently collapsed
    const areAllCollapsed = Object.keys(groupedExpenses).every(
      key => collapsedGroups[key]
    );

    setAllCollapsed(areAllCollapsed);
  }, [groupedExpenses, collapsedGroups]);

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle clicks outside filter panel and scroll events
  useEffect(() => {
    if (!showFilters) return; // Skip if filters not shown

    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current &&
        filterButtonRef.current &&
        !filterPanelRef.current.contains(event.target as Node) &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    const handleScroll = () => setShowFilters(false);

    // Add and clean up event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [showFilters]);

  // Handle clicks outside group by panel and scroll events
  useEffect(() => {
    if (!showGroupByOptions) return; // Skip if options not shown

    const handleClickOutside = (event: MouseEvent) => {
      if (
        groupByPanelRef.current &&
        groupByButtonRef.current &&
        !groupByPanelRef.current.contains(event.target as Node) &&
        !groupByButtonRef.current.contains(event.target as Node)
      ) {
        setShowGroupByOptions(false);
      }
    };

    const handleScroll = () => setShowGroupByOptions(false);

    // Add and clean up event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [showGroupByOptions]);

  // Handle range selection
  const handleRangeChange = (range: DateRange) => {
    setSelectedRange(range);
    setShowFilters(false);
  };

  // Handle group by option selection
  const handleGroupByChange = (option: GroupByOption) => {
    setIsRegrouping(true);
    if (option === "days" && selectedSortBy !== null) {
      setSelectedGroupBy(option);
      setSelectedSortBy("date");
    } else {
      setSelectedGroupBy(option);
      setSelectedSortBy("count");
    }
    setShowGroupByOptions(false);
  };

  // Handle sort by option selection
  const handleSortByChange = (option: SortByOption) => {
    setIsRegrouping(true);
    setSelectedSortBy(option);
    setShowGroupByOptions(false);
  };

  // Render expense item
  const renderExpenseItem = (expense: Expense, index: number) => (
    <Row key={index} className="expense-row" onClick={() => onSetExpense(expense)}>
      <Avatar className="expense-avatar">
        <CurrencyRupeeIcon fontSize="inherit"/>
      </Avatar>
      <Col>
        <Row className="expense-row-header">
          <Col>
            <span className="vendor-name">{expense.vendor.toLowerCase()}</span>
          </Col>
          <Col xs="auto" className='d-flex justify-content-end mr-2'>
            <span className='expense-type'>
              {expense.costType === 'debit' ? '-' : '+'}
            </span>
            <span className="expense-currency">₹</span>
            <span className="expense-cost">{expense.cost}</span>
          </Col>
        </Row>
        <Row className="expense-date-row">
          <span className="expense-date">{getDateMonth(expense.date)}</span>
        </Row>
        <Row>
          <Col>
            <span className={expense.tag ? 'tag-text-red' : 'tag-text-purple-light'}>
              {expense.tag ? expense.tag : 'untagged'}
            </span>
          </Col>
        </Row>
      </Col>
    </Row>
  );

  // Render a group section
  const renderGroupSection = (groupKey: string, groupData: GroupedExpenses[string]) => {
    const isCollapsed = collapsedGroups[groupKey] || false;

    return (
      <div key={groupKey} className={`group-box ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="group-header" onClick={() => toggleGroupCollapse(groupKey)}>
          <div className="group-title">
            <span className="group-label">
              {
                selectedGroupBy === 'days' ? groupData.groupLabel : groupData.groupLabel.toLowerCase()
              }
            </span>
            <span
              className="expense-count">{groupData.expenses.length} expense{groupData.expenses.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="group-summary">
            <span className="total-amount">₹{groupData.totalAmount.toFixed(0)}</span>
            <IconButton className={`collapse-button ${isCollapsed ? 'collapsed' : ''}`}>
              {isCollapsed ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/>}
            </IconButton>
          </div>
        </div>

        <div className={`group-expenses ${isCollapsed ? 'collapsing' : ''}`}>
          {!isCollapsed && groupData.expenses.map((expense, index) => renderExpenseItem(expense, index))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <Loading/>;
  }

  return (
    <div className="home-root">
      {/* Loading overlay for regrouping */}
      <Fade in={isRegrouping} timeout={100} unmountOnExit>
        <div className="regrouping-overlay">
          <CircularProgress color="primary"/>
        </div>
      </Fade>

      <div className="search-container">
        <TextField
          fullWidth
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="search-icon"/>
              </InputAdornment>
            ),
            className: "search-input"
          }}
        />
      </div>

      <div className="home-list">
        {filteredExpenses.length === 0 ? (
          <div className="no-expenses">
            {searchTerm ? "No matching expenses found" : "No expenses found for selected period"}
          </div>
        ) : (
          Object.entries(groupedExpenses)
            .sort(([keyA, groupDataA], [keyB, groupDataB]) => {

              if (selectedGroupBy === 'days' &&
                (selectedSortBy === 'date' || selectedSortBy == null))
                return keyB.localeCompare(keyA);

              return selectedSortBy === "cost" ?
                groupDataB.totalAmount - groupDataA.totalAmount :
                groupDataB.expenses.length - groupDataA.expenses.length;
            })
            .map(([groupKey, groupData]) => renderGroupSection(groupKey, groupData))
        )}
      </div>

      {/* Filter button & Group by button container */}
      <div className="buttons-container">
        {/* Filter button */}
        <div className="filter-button" onClick={toggleFilters} ref={filterButtonRef}>
          <Chip
            icon={<FilterListIcon/>}
            label={filterOptions.find(option => option.id === selectedRange)?.label}
            color="primary"
            clickable
          />
        </div>

        {/* Group by button */}
        <div className="group-by-button" onClick={toggleGroupByOptions} ref={groupByButtonRef}>
          <Chip
            icon={<GroupIcon/>}
            label={'Group: ' + groupByOptions.find(option => option.id === selectedGroupBy)?.label}
            color="primary"
            clickable
          />
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="filter-panel" ref={filterPanelRef}>
          <div className="panel-header">
            <span className="panel-title">Filter by date range</span>
            <IconButton
              size="small"
              className="close-button"
              onClick={() => setShowFilters(false)}
            >
              <CloseIcon/>
            </IconButton>
          </div>
          <div className="filter-options">
            {filterOptions.map(option => (
              <Chip
                key={option.id}
                label={option.label}
                color="primary"
                variant={selectedRange === option.id ? "filled" : "outlined"}
                onClick={() => handleRangeChange(option.id)}
                className="filter-chip"
              />
            ))}
          </div>
        </div>
      )}

      {/* Group by panel */}
      {showGroupByOptions && (
        <div className="group-by-panel" ref={groupByPanelRef}>
          <div className="panel-header">
            <span className="panel-title">Group by</span>
            <IconButton
              size="small"
              className="close-button"
              onClick={() => setShowGroupByOptions(false)}
            >
              <CloseIcon/>
            </IconButton>
          </div>

          {/* Group by section */}
          <div className="panel-section">
            <div className="section-title">Group by</div>
            <div className="group-by-options">
              {groupByOptions.map(option => (
                <Chip
                  key={option.id}
                  label={option.label}
                  color="primary"
                  variant={selectedGroupBy === option.id ? "filled" : "outlined"}
                  onClick={() => handleGroupByChange(option.id)}
                  className="filter-chip"
                />
              ))}
            </div>
          </div>

          {/* Sort by section */}
          <div className="panel-section">
            <div className="section-title">Sort by</div>
            <div className="sort-by-options">
              {sortByOptions.map(option => (
                <Chip
                  key={option.id}
                  label={option.label}
                  color="primary"
                  variant={selectedSortBy === option.id ? "filled" : "outlined"}
                  onClick={() => handleSortByChange(option.id)}
                  className="filter-chip"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          size="medium"
          aria-label="scroll back to top"
          onClick={scrollToTop}
          className="scroll-top-button"
        >
          <KeyboardArrowUpIcon/>
        </Fab>
      </Zoom>

      {/* Collapse all button - only show when we have expenses */}
      {filteredExpenses.length > 0 && (
        <Fab
          color="primary"
          size="medium"
          aria-label={allCollapsed ? "expand all groups" : "collapse all groups"}
          onClick={toggleAllGroupsCollapse}
          className="collapse-all-button"
        >
          {allCollapsed ? <UnfoldMoreIcon/> : <UnfoldLessIcon/>}
        </Fab>
      )}
    </div>
  );
};

export default Home;

