import React, { PureComponent } from "react";
import GithubBadge from "react-github-badge";
import { render } from "react-dom";
import { css } from "emotion";
import Drawer from "../../src";
import Checkbox from './Checkbox';

const items = [
  'Man',
  'Woman',
  'Children',
];
class Demo extends PureComponent {
  constructor(props) {
   super(props);
   this.state = {value: '',isGoing: true};
   this.handleInputChange = this.handleInputChange.bind(this);
   this.handleChange = this.handleChange.bind(this);
   this.handleSubmit = this.handleSubmit.bind(this);
 }
 componentWillMount = () => {
   this.selectedCheckboxes = new Set();
 }
 toggleCheckbox = label => {
    if (this.selectedCheckboxes.has(label)) {
      this.selectedCheckboxes.delete(label);
    } else {
      this.selectedCheckboxes.add(label);
    }
  }

  handleFormSubmit = formSubmitEvent => {
    formSubmitEvent.preventDefault();

    for (const checkbox of this.selectedCheckboxes) {
      console.log(checkbox, 'is selected.');
    }
  }

  createCheckbox = label => (
    <Checkbox
      label={label}
      handleCheckboxChange={this.toggleCheckbox}
      key={label}
    />
  )

  createCheckboxes = () => (
    items.map(this.createCheckbox)
  )


 handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    console.log(name);

    this.setState({
      [name]: value
    });
  }

  handleChange(event) {
      this.setState({value: event.target.value});
    }

    handleSubmit(event) {
      alert('A name was submitted: ' + this.state.value);
      event.preventDefault();
    }
  toggle = (type, value) => event => {
    this.setState(state => {
      return {
        [type]: value
      };
    });
  };

  render() {
    const {
      regular,
      sidebarLeft,
      sidebarRight,
      asyncHeight,
      crazyStyle
    } = this.state;

    return (
      <div className={`${Reset} ${Container}`}>
        <h1>React Drag Drawer</h1>
        <button onClick={this.toggle("regular", true)} className={Toggle}>
          Open example
        </button>
        <div className={Break} />
        <Drawer
          open={regular}
          onRequestClose={this.toggle("regular", false)}
          modalElementClass={ModalElement}
        >
          <div className={Card}>
            I'm in a drawer!
            <form onSubmit={this.handleSubmit}>
         <label>
           Name:
           <input type="text" value={this.state.value} onChange={this.handleChange} />
         </label>
         <input type="submit" value="Submit" />
         <br />
         <br />
         <label>
          Pick your favorite flavor:
          <select value={this.state.selectv} onChange={this.handleChange}>
            <option value="grapefruit">Grapefruit</option>
            <option value="lime">Lime</option>
            <option value="coconut">Coconut</option>
            <option value="mango">Mango</option>
          </select>
        </label>
        <br />
        <br />
       </form>
       <form onSubmit={this.handleFormSubmit}>
              {this.createCheckboxes()}
              <button className="btn btn-default" type="submit">Save</button>
            </form>
            <button className={Toggle} onClick={this.toggle("regular", false)}>
              Close drawer
            </button>
          </div>
        </Drawer>

        <Drawer
          open={sidebarLeft}
          onRequestClose={this.toggle("sidebarLeft", false)}
          modalElementClass={Sidebar}
          direction="left"
        >
          <div className={Card}>
            I'm a sidebar drawer
            <button
              className={Toggle}
              onClick={this.toggle("sidebarLeft", false)}
            >
              Close drawer
            </button>
          </div>
        </Drawer>

        <AsyncHeightDrawer
          open={asyncHeight}
          onRequestClose={this.toggle("asyncHeight", false)}
          modalElementClass={HugeList}
        />
      </div>
    );
  }
}

const Info = ({ children }) => <p className={InfoComponent}>{children}</p>;

class AsyncHeightDrawer extends PureComponent {
  state = {
    asyncData: []
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.open === false && nextProps.open === true) {
      setTimeout(() => {
        const newArray = new Array(500).fill(true);

        this.setState({ asyncData: newArray });
      }, 200);
    }
    if (nextProps.open === false && this.props.open) {
      this.setState({ asyncData: [] });
    }
  }
  render() {
    return (
      <Drawer {...this.props}>
        <div className={Card}>
          <button className={Toggle} onClick={this.props.onRequestClose}>
            Close drawer
          </button>
          <br />
          <div className={Content}>
            {this.state.asyncData.length === 0 ? (
              <div>Loading...</div>
            ) : (
              this.state.asyncData.map((_, index) => (
                <div key={index}>{index}</div>
              ))
            )}
          </div>
        </div>
      </Drawer>
    );
  }
}

const Reset = css`
  html,
  body {
    margin: 0;
    padding: 0;
  }

  * {
    box-sizing: border-box;
  }
`;

const Content = css`
  background-color: white;
`;

const Card = css`
  height: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 40px auto;

  @media (min-width: 768px) {
    border-radius: 0;
  }

  button {
    margin-top: 50px;
  }
`;

const Toggle = css`
  background-color: #d50152;
  border-radius: 4px;
  color: white;
  border: 0;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  transition: all 0.25s linear;

  &:active {
    transform: scale(0.9);
  }
`;

const modal = css`
  position: absolute;
  top: 30px;
  background-color: white;
  width: 100%;
  max-width: 700px;
  min-height: 70%;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const Sidebar = css`
  ${modal} top: 0;
  max-width: 300px;
  border-radius: 0;
  left: 0;
`;

const CrazyStyle = css`
  ${modal} top: auto;
  min-height: 100%;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
`;

const ModalElement = css`
  ${modal} text-align: center;

  @media (max-width: 767px) {
    width: 100%;
  }
`;

const HugeList = css`
  ${modal} text-align: center;
  overflow: auto;

  @media (max-width: 767px) {
    width: 100%;
  }
`;

const Container = css`
  margin: 0 auto;
  max-width: 100%;
  font-family: arial;
  max-width: 600px;
  padding: 48px 16px;

  @media (max-width: 767px) {
    padding: 80px 16px;
  }
`;

const InfoComponent = css``;

const Break = css`
  width: 100%;
  margin-bottom: 20px;
  margin-top: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const Code = css`
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

render(<Demo />, document.querySelector("#demo"));
