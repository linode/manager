## Usage

### Basic

```js
const MyComponent = props => {

  const [selectedLinode, setSelectedLinode] = React.useState<number | undefined>(undefined);

  const handleSelect = (linode: Linode.Linode) => {
    setSelectedLinode(linode.id)
  }

  return (
    <LinodeSelect
      selectedLinode={selectedLinode}
      handleSelect={handleSelect}
    />
  )
}
```

### With Custom Value and Label

```js

const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;

const MyComponent = props => {

  const [selectedLinode, setSelectedLinode] = React.useState<number | undefined>(undefined);

  const handleSelect = (linode: Linode.Linode) => {
    setSelectedLinode(linode.id)
  }

  return (
    <LinodeSelect
      selectedLinode={selectedLinode}
      handleSelect={handleSelect}
      valueOverride={linode => {
        /** value will be the first private IP of each Linode */
        return linodes.ipv4.find(eachIP => eachIP.match(privateIPRegex))
      }}
      labelOverride={linode => {
        const thisLinodesPrivateIP = linodes.ipv4.find(eachIP => eachIP.match(privateIPRegex));
        /** label will be "myLinode - 192.168.12.12" */
        return `${linode.label} - ${thisLinodesPrivateIP}`
      }}
    />
  )
}
```