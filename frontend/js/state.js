// Reactive Central State Store
class Store {
  constructor() {
    this.state = {
      user: null,
      authenticated: false,
      theme: localStorage.getItem('hrmailer_theme') || 'auto',
      settings: {},
      draftCampaign: {
        title: '',
        subject: '',
        templateBody: '',
        signature: '',
        rawEmails: '',
        attachments: [],
        parsedData: null
      },
      activeCampaignId: null,
      activeProgress: null
    };

    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

window.store = new Store();
