import { Link, LinkProps } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { TouchableOpacity, Text } from 'react-native';
import { Platform } from 'react-native';

type Props = {
  url: string;
  children: React.ReactNode;
  style?: any;
};

export function ExternalLink({ url, children, style }: Props) {
  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await WebBrowser.openBrowserAsync(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style}>
      {children}
    </TouchableOpacity>
  );
}

// Internal link için ayrı bir bileşen
export function InternalLink(props: LinkProps) {
  return <Link {...props} />;
}
