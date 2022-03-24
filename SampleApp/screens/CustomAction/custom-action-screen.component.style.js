import { StyleSheet, Platform } from "react-native";
import { ANDROID } from "../../enums/os";

export default StyleSheet.create({
	row: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		height: 40,
	},
	textInput: {
		paddingLeft: 8,
		textAlign: 'left',
		height: Platform.OS === ANDROID ? 40 : 30,
		flexGrow: 1,
		borderWidth: 1,
		borderColor: '#cccccc',
		borderRadius: 5,
	},
	title: {
		paddingTop: 16,
		paddingBottom: 8,
		fontWeight: 'bold',
	},
	rowTitle: {
		width: 90,
		paddingRight: 16,
	},
	scrollView: {
		paddingTop: 8,
		paddingBottom: 8,
		paddingLeft: 16,
		paddingRight: 16,
	},
});