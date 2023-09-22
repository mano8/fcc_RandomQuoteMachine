/**
 * Random Quote Machine
 **/
const MAX_QUOTE_LENGTH = 155;
// Redux:

//-> Actions constant
const REFRESH = 'REFRESH',
    QUOTE_UPDATED = 'QUOTE_UPDATED',
    REQUESTING_DATA = 'REQUESTING_DATA',
    RECEIVED_DATA = 'RECEIVED_DATA',
    DATA_ERROR = 'DATA_ERROR';

//-> Actions Creator
const requestingData = () => { return {type: REQUESTING_DATA} };
const receivedData = (quotes) => { return {type: RECEIVED_DATA, quotes: quotes} };
const newQuote = () => { return {type: REFRESH} };
const quoteUpdated = (quote) => { return {type: QUOTE_UPDATED, quote: quote} };
const dataError = (error) => { return {type: DATA_ERROR, error: error} };

//-> colors keys
// !!! Important !!! : Keys must match ccs color keys
const colorKeys = [
    'color1', 'color2', 'color3', 'color4', 'color5',
    'color6', 'color7', 'color8', 'color9', 'color10',
    'color11', 'color12'
]

/**
*
**/
const refreshQuote = (quotesData) => {
    if(Array.isArray(quotesData) && quotesData.length > 0){
        const quote = quotesData[
            Math.floor(Math.random() * quotesData.length)
            ];
        console.log("New quote selected : ");
        console.log(quote);
        return quote;
    }
    else{
        console.log("New quote empty no quotes data.");
    }
    return {};
}

/**
 *
 **/
const refreshColor = () => {
    const color = colorKeys[
        Math.floor(Math.random() * colorKeys.length)
        ];
    console.log("New color selected : ");
    console.log(color);
    return color;
}
/**
 * Clean Json Quotes
 * Remove all quotes with length upper-more than MAX_QUOTE_LENGTH.
 *
 **/
const cleanJsonQuotes = (quotes) =>{
    if(Array.isArray(quotes)){
        return quotes.filter((data, key) => {
            const nb_chars = data.quote.length
            if(nb_chars <= MAX_QUOTE_LENGTH){
                return data
            }
            else{
                console.log(`Remove too bigger quote from list. ${nb_chars}/${MAX_QUOTE_LENGTH} -- key : ${key}`)
            }
        })
    }
    return null;
}

/**
 * Load Json Quotes
 **/
const loadJsonQuotes = () => {
    return new Promise((resolve, reject) => {
        // First create an XMLHttprequest object
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://mano8.github.io/fcc_RandomQuoteMachine8/json/quotes.json", true);
        xhr.getResponseHeader("Content-type", "application/json");

        xhr.onload = function() {
            const data = JSON.parse(this.responseText);
            console.log("Json Quotes");
            console.log(data.quotes);
            resolve(cleanJsonQuotes(data.quotes));
        }

        xhr.onerror = () => {
            reject();
        }

        xhr.send();
    });
}

/**
 * Async action used to load data from ajax request.
 **/
const loadQuotesAsync = () => {
    return function(dispatch) {
        // Dispatch request action here
        dispatch(requestingData());
        console.log("requestingData");
        loadJsonQuotes()
            .then((quotes) => {
                console.log("receivedData");
                dispatch(receivedData(quotes));
            })
            .catch(() => {
                console.log("Fatal Error: Unable to get Quotes");
                dispatch(dataError("Sorry we are unable to load Quotes list from the server."))
            });
    }
};

/**
 * Default state values.
 **/
const defaultState = {
    status: true,
    fetching: true,
    quotes: [],
    quote: {},
    color: '',
    error_msg: ''
};

/**
 * Redux Reducer
 **/
const asyncDataReducer = (state = defaultState, action) => {
    switch(action.type) {
        case REQUESTING_DATA:
            return {
                status: true,
                fetching: true,
                quotes: [],
                quote: {},
                color: '',
                error_msg: ''
            }
        case RECEIVED_DATA:
            return {
                status: true,
                fetching: false,
                quotes: [...action.quotes],
                quote: refreshQuote(action.quotes),
                color: refreshColor(),
                error_msg: ''
            }
        case REFRESH:
            console.log("REFRESH Quote action.");
            console.log("Actual state.quotes : ")
            console.log(state.quotes)
            return {
                status: true,
                fetching: false,
                quotes: state.quotes,
                quote: refreshQuote(state.quotes),
                color: refreshColor(),
                error_msg: ''
            };
        case DATA_ERROR:
            console.log("DATA_ERROR Quote action.");
            return {
                status: false,
                fetching: false,
                quotes: [],
                quote: '',
                color: refreshColor(),
                error_msg: action.error
            };
        default:
            return state;
    }
};

const store = Redux.createStore(
    asyncDataReducer,
    Redux.applyMiddleware(ReduxThunk)
);

// React:
const Provider = ReactRedux.Provider;
const connect = ReactRedux.connect;

const getColorKey = (color, defaultColor="dark") =>{
    return (color) ? color : defaultColor;
}

/**
 * Random Quote Text and author Component
 **/
class RandomQuote extends React.Component {
    constructor(props) {
        super(props);
    }
    render(){
        console.log("Render RandomQuote Component.");
        console.log("RandomQuote props : ");
        console.log(this.props);
        const colorKey = getColorKey(this.props.color);
        return(
            <div className="quote-wrapper">
                <div id="text" className={`text-${colorKey}`} >
                    <i className={`fa fa-quote-left text-${colorKey}`}></i>
                    <span className={`quote text-${colorKey}`}>{(this.props.quote.quote) ? this.props.quote.quote : "My Random Quote Machine !!!"}</span>
                    <i className={`fa fa-quote-right text-${colorKey}`}></i>
                </div>
                <hr className={`border-${colorKey}`} />
                <div id="author" className={`text-${colorKey}`}>
                    {(this.props.quote.author) ? this.props.quote.author : "by No-Body !!!"}
                </div>
                <hr className={`border-${colorKey}`} />
            </div>
        )
    }
}

/**
 * Social Quote Publisher Component
 **/
class SocialPublisher extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render(){
        console.log("Render SocialPublisher Component.");
        console.log("SocialPublisher props : ");
        console.log(this.props);
        const colorKey = getColorKey(this.props.color);
        const quote = this.props.quote.quote,
            author = this.props.quote.author,
            prms = encodeURIComponent('"' + quote + '" ' + author),
            tweet_link = "https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text=" + prms;
        let tumblr_link = `https://www.tumblr.com/widgets/share/tool?posttype=quote&tags=quotes,freecodecamp`;

        tumblr_link += `&caption=${encodeURIComponent(author)}&content=${encodeURIComponent(quote)}`;
        tumblr_link += `&canonicalUrl=https%3A%2F%2Fwww.tumblr.com%2Fbuttons&shareSource=tumblr_share_button`
        return(
            <div className="quote-publish">
                <a href={tweet_link} id="tweet-quote" target="_blank" className={`text-${colorKey}`}>
                    <i className="fab fa-twitter"></i>
                </a>
                <a href={tumblr_link}  target="_blank" className={`text-${colorKey}`}>
                    <i className="fab fa-tumblr"></i>
                </a>
            </div>
        );
    }
}

/**
 * Main Random Quote Machine component
 */
class QuoteMachine extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
        };
    }
    render(){
        console.log("Render QuoteMachine Component.");

        console.log("QuoteMachine render props : ");
        console.log(this.props);

        const colorKey = getColorKey(this.props.color);
        return(
            <div id="quote-box" className={`wrapper box-dark`}>
                <RandomQuote quote={this.props.quote} color={this.props.color} />
                <div className="quote-footer">
                    <SocialPublisher  quote={this.props.quote} color={this.props.color} />
                    <div className="quote-refresh">
                        <button id="new-quote" className={`btn btn-${colorKey}`} onClick={this.props.refreshQuote}>Next Quote</button>
                    </div>
                </div>
            </div>
        )
    }
}

/**
 * Error Box Message
 */
class ErrorBox extends React.Component {

    constructor(props) {
        super(props);
    }
    render(){
        console.log("Render ErrorBox Component.");
        console.log("ErrorBox props : ");
        console.log(this.props);
        return(
            <div id="quote-box" className={`wrapper box-error`}>
                <div className="error-header">
                    <h1>Random Quote Machine : Error</h1>
                </div>
                <div className="error-message">
                    {this.props.error_msg}
                </div>
            </div>
        )
    }
}

/**
 * Main Root component
 **/
class Root extends React.Component {
    constructor(props) {
        super(props);
        this.props.loadQuotes();
    }

    render(){
        if(this.props.data && this.props.data.fetching === false){
            console.log("Render Root Component.");
            console.log("Root props : ");
            console.log(this.props);
            const colorKey = getColorKey(this.props.data.color);
            if(this.props.data.status === false){
                return(
                    <section className={`container box-${colorKey}`}>
                        <ErrorBox error_msg={this.props.data.error_msg} />
                    </section>
                )
            }else{
                return(
                    <section className={`container box-${colorKey}`}>
                        <div className={`wrapper-header text-${colorKey}`}>
                            <h1><strong>The Random Quote Machine</strong></h1>
                        </div>
                        <QuoteMachine quote={this.props.data.quote} color={colorKey} refreshQuote={this.props.refreshQuote} />
                        <div className={`app-author text-${colorKey}`}>
                            <strong>By Eli Serra</strong>
                        </div>
                    </section>
                )
            }

        }
        else{
            console.log("Render Root Component and wait for quotes data.");
        }
    }
}

// React-Redux
const mapStateToProps = (state) => {
    return {data: state}
};

const mapDispatchToProps = (dispatch) => {
    return {
        refreshQuote: () => {
            dispatch(newQuote());
        },
        loadQuotes: () => {
            dispatch(loadQuotesAsync());
        }
    }
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Root);

class AppWrapper extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <Container/>
            </Provider>
        );
    }
}


ReactDOM.render(<AppWrapper />, document.getElementById('app'));