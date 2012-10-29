// Functions Go Here

function test() {
	// body...
}

$(function(){ // on ready code goes here
	
	if ($.support.cors)
		$.ajax({ url: 'http://truecount-localhost.s3.amazonaws.com', crossDomain : true, type: 'HEAD' });
	
	var form = $(this);
	$('.direct-upload').fileupload({
		url: form.attr('action'),
		type: 'POST',
		// autoUpload: true,
		dataType: 'xml', // This is really important as s3 gives us back the url of the file in a XML document
		process: [
			{
				action: 'load',
				fileTypes: /^image\/(gif|jpeg|png)$/,
				maxFileSize: 20000000 // 20MB
			},
			{
				action: 'resize',
				maxWidth: 1024,
				maxHeight: 1024
			},
			{
				action: 'save'
			}
		],
		add: function (event, data) {
			$(this).fileupload('process', data).done(function () {
				
				$.ajax({
					url: "/signed_url",
					type: 'GET',
					dataType: 'json',
					data: {doc: {title: data.files[0].name}}, // send the file name to the server so it can generate the key param
					async: false,
					success: function(keys) {
					// Now that we have our data, we update the form so it contains all
					// the needed data to sign the request
						form.find('input[name=key]').val(keys.key)
						form.find('input[name=policy]').val(keys.policy)
						form.find('input[name=signature]').val(keys.signature)
						data.submit();
					}
				})
			});
			
			
			// $.ajax({
			// 	url: "/signed_url",
			// 	type: 'GET',
			// 	dataType: 'json',
			// 	data: {doc: {title: data.files[0].name}}, // send the file name to the server so it can generate the key param
			// 	async: false,
			// 	success: function(data) {
			// 	// Now that we have our data, we update the form so it contains all
			// 	// the needed data to sign the request
			// 		form.find('input[name=key]').val(data.key)
			// 		form.find('input[name=policy]').val(data.policy)
			// 		form.find('input[name=signature]').val(data.signature)
			// 	}
			// })
			// data.submit();
		}, send: function(e, data) {
			$('.progress').fadeIn();
		}, progress: function(e, data){
			// This is what makes everything really cool, thanks to that callback
			// you can now update the progress bar based on the upload progress
			var percent = Math.round((e.loaded / e.total) * 100)
			$('.bar').css('width', percent + '%')
			console.log('uploading');
		}, fail: function(e, data) {
			console.log('fail')
		}, success: function(data) {
			// Here we get the file url on s3 in an xml doc
			// var url = $(data).find('Location').text()
			var url = $(data).find('Location').text().replace(/%2F/g,'/'); // S3::XML::URL
			// $('#real_file_url').val(url) // Update the real input in the other form
			console.log("URL: "+url);
		}, done: function (event, data) {
			$('.progress').fadeOut(300, function() {
				$('.bar').css('width', 0)
			})
		},
	});
	
})